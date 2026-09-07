import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../services/ai.service';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

export const interviewController = {
  async start(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { jobTitle, jobDescription } = req.body;
      if (!jobTitle) return res.status(400).json({ status: 'error', message: 'Job title is required' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const resumeText = user?.resumeText || undefined;

      const questions = await AiService.generateInterviewQuestions(jobTitle, jobDescription, resumeText);

      const session = await prisma.interviewSession.create({
        data: {
          userId,
          jobTitle,
          jobDescription,
          questions: JSON.stringify(questions),
          status: 'in_progress'
        }
      });

      res.json({ status: 'success', data: { sessionId: session.id, questions } });
    } catch (error) {
      if ((req as any).refundCredit) await (req as any).refundCredit();
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to start interview session' });
    }
  },

  async submitAnswer(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const id = req.params.id as string;
      const { questionIndex, answer } = req.body;

      const session = await prisma.interviewSession.findUnique({ where: { id } });
      if (!session || session.userId !== userId) {
        return res.status(404).json({ status: 'error', message: 'Session not found' });
      }

      const questions = JSON.parse(session.questions);
      const question = questions[questionIndex];

      if (!question) {
        return res.status(400).json({ status: 'error', message: 'Invalid question index' });
      }

      const jobContext = session.jobDescription || session.jobTitle;
      
      let evaluation;
      if (!answer || answer.trim().length < 15) {
        // Prevent cheating (empty string or "Tôi không biết")
        evaluation = {
          score: 1,
          strengths: "Không có",
          improvements: "Câu trả lời quá ngắn hoặc không có nội dung thực chất.",
          suggestedAnswer: "Bạn nên cố gắng trả lời chi tiết hơn, ít nhất 2-3 câu, áp dụng mô hình STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả) để nhà tuyển dụng hiểu rõ năng lực của bạn."
        };
      } else {
        evaluation = await AiService.evaluateInterviewAnswer(question, answer, jobContext);
      }

      const answerRecord = await prisma.interviewAnswer.create({
        data: {
          sessionId: id,
          questionIndex,
          question,
          answer,
          score: evaluation.score,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          suggestedAnswer: evaluation.suggestedAnswer
        }
      });

      // Check if all questions are answered
      const answeredCount = await prisma.interviewAnswer.count({ where: { sessionId: id } });
      if (answeredCount >= questions.length && session.status !== 'completed') {
        const allAnswers = await prisma.interviewAnswer.findMany({ where: { sessionId: id } });
        const avgScore = Math.round(allAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / allAnswers.length);
        
        // Generate dynamic feedback based on performance
        let feedback: string;
        if (avgScore >= 8) {
          feedback = `Tuyệt vời! Bạn đã thể hiện rất xuất sắc trong buổi phỏng vấn vị trí "${session.jobTitle}". Câu trả lời có chiều sâu, logic rõ ràng và thể hiện kinh nghiệm thực tiễn vững vàng. Bạn đã sẵn sàng cho buổi phỏng vấn thật!`;
        } else if (avgScore >= 6) {
          feedback = `Khá tốt! Bạn đã trả lời phần lớn câu hỏi một cách hợp lý cho vị trí "${session.jobTitle}". Tuy nhiên, một số câu trả lời vẫn cần bổ sung thêm ví dụ cụ thể và áp dụng mô hình STAR chặt chẽ hơn. Hãy xem lại phần "Câu trả lời mẫu" để cải thiện.`;
        } else if (avgScore >= 4) {
          feedback = `Cần cải thiện thêm cho vị trí "${session.jobTitle}". Nhiều câu trả lời còn chung chung, thiếu dẫn chứng cụ thể. Hãy luyện tập thêm bằng cách xem kỹ "Câu trả lời mẫu STAR" và thử phỏng vấn lại sau khi chuẩn bị kỹ hơn.`;
        } else {
          feedback = `Kết quả cho thấy bạn cần đầu tư nhiều thời gian hơn để chuẩn bị cho vị trí "${session.jobTitle}". Hãy nghiên cứu kỹ JD, liệt kê các kinh nghiệm liên quan, và luyện tập trả lời theo mô hình STAR (Tình huống → Nhiệm vụ → Hành động → Kết quả).`;
        }
        
        await prisma.interviewSession.update({
          where: { id },
          data: {
            status: 'completed',
            overallScore: avgScore,
            feedback,
          }
        });

        // Send notification
        await createNotificationHelper(
          userId,
          `Phỏng vấn "${session.jobTitle}" hoàn tất! 🎤`,
          `Bạn đạt ${avgScore}/10 điểm. Xem lại bảng điểm chi tiết và câu trả lời mẫu ngay.`,
          'success',
          '/mock-interview'
        );
      }

      res.json({ status: 'success', data: answerRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to evaluate answer' });
    }
  },

  async getSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const id = req.params.id as string;
      const session = await prisma.interviewSession.findUnique({
        where: { id },
        include: { answers: { orderBy: { questionIndex: 'asc' } } }
      });

      if (!session || session.userId !== userId) {
        return res.status(404).json({ status: 'error', message: 'Session not found' });
      }

      res.json({ status: 'success', data: session });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch session' });
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const sessions = await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ status: 'success', data: sessions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
    }
  }
};
