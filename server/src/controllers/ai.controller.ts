import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../services/ai.service';
import { createNotificationHelper } from './notification.controller';
import { extractCvDocument } from '../utils/pdfExtractor';

const prisma = new PrismaClient();

export const aiController = {
  async generateRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { goal } = req.body;
      if (!goal) return res.status(400).json({ status: 'error', message: 'Goal is required' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const roadmapData = await AiService.generateCareerRoadmap(goal, user?.resumeText || undefined);

      const savedRoadmap = await prisma.careerRoadmap.create({
        data: {
          userId,
          goal,
          roadmap: JSON.stringify(roadmapData),
        }
      });

      // Notification
      await createNotificationHelper(
        userId,
        'Lộ trình sự nghiệp đã tạo! 🚀',
        `Lộ trình phát triển cho mục tiêu "${goal}" đã sẵn sàng. Hãy bắt đầu học ngay!`,
        'info',
        '/roadmap'
      );

      res.json({ status: 'success', data: savedRoadmap });
    } catch (error) {
      if ((req as any).refundCredit) await (req as any).refundCredit();
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to generate roadmap' });
    }
  },

  async getActiveRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const roadmap = await prisma.careerRoadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ status: 'success', data: roadmap });
    } catch (error) {
      console.error('Error getting active roadmap:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch roadmap' });
    }
  },

  async updateRoadmapProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const id = req.params.id as string;
      const { roadmap } = req.body;

      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      await prisma.careerRoadmap.updateMany({
        where: { id, userId },
        data: {
          roadmap: typeof roadmap === 'string' ? roadmap : JSON.stringify(roadmap),
        }
      });

      res.json({ status: 'success', message: 'Roadmap progress saved' });
    } catch (error) {
      console.error('Error updating roadmap progress:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update progress' });
    }
  },

  async analyzeCV(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { resumeText, jobDescription } = req.body;
      if (!resumeText) return res.status(400).json({ status: 'error', message: 'Resume text is required' });

      const analysis = await AiService.analyzeCV(resumeText, jobDescription);

      // Auto-sync resume text to user profile so match breakdown & mock interview have it
      await prisma.user.update({
        where: { id: userId },
        data: { resumeText }
      });

      const savedAnalysis = await prisma.cvAnalysis.create({
        data: {
          userId,
          score: analysis.score || 0,
          feedback: analysis.feedback || 'No feedback'
        }
      });

      await createNotificationHelper(
        userId,
        'Phân tích CV hoàn tất',
        `Gemini AI đã hoàn thành báo cáo ATS cho hồ sơ của bạn với điểm số ${analysis.score || 0}/100.`,
        'success',
        '/cv-analysis'
      );

      res.json({ status: 'success', data: analysis });
    } catch (error) {
      if ((req as any).refundCredit) await (req as any).refundCredit();
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to analyze CV' });
    }
  },

  async skillGap(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { targetRole } = req.body;
      if (!targetRole) return res.status(400).json({ status: 'error', message: 'Target role is required' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.resumeText) return res.status(400).json({ status: 'error', message: 'Resume text is required. Please upload CV first.' });

      const analysis = await AiService.generateSkillGapAnalysis(user.resumeText, targetRole);

      res.json({ status: 'success', data: analysis });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to analyze skill gap' });
    }
  },
  
  async uploadCV(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { cvText } = req.body;
      if (!cvText) return res.status(400).json({ status: 'error', message: 'CV text is required' });

      await prisma.user.update({
        where: { id: userId },
        data: { resumeText: cvText }
      });

      res.json({ status: 'success', message: 'CV uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to upload CV' });
    }
  },

  async textToSpeech(req: Request, res: Response) {
    try {
      const text = (req.query.text as string || req.body?.text as string || '').trim();
      if (!text) {
        return res.status(400).json({ status: 'error', message: 'Text is required' });
      }

      // Clean text: strip markdown syntax
      const cleanText = text
        .replace(/[*#_`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Split text into chunks under 180 chars on sentence boundaries
      const sentences = cleanText.match(/[^.?!,;:]+[.?!,;:]?/g) || [cleanText];
      const chunks: string[] = [];
      let currentChunk = '';

      for (const s of sentences) {
        const trimmed = s.trim();
        if (!trimmed) continue;
        if ((currentChunk + ' ' + trimmed).length < 180) {
          currentChunk += (currentChunk ? ' ' : '') + trimmed;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (trimmed.length >= 180) {
            const words = trimmed.split(' ');
            let wordChunk = '';
            for (const w of words) {
              if ((wordChunk + ' ' + w).length < 180) {
                wordChunk += (wordChunk ? ' ' : '') + w;
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = w;
              }
            }
            if (wordChunk) chunks.push(wordChunk);
            currentChunk = '';
          } else {
            currentChunk = trimmed;
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      // Synthesize audio chunks via Google TTS API
      const buffers: Buffer[] = [];
      for (const chunk of chunks) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (response.ok) {
          const arrBuf = await response.arrayBuffer();
          buffers.push(Buffer.from(arrBuf));
        }
      }

      if (buffers.length === 0) {
        return res.status(500).json({ status: 'error', message: 'Failed to synthesize speech' });
      }

      const fullAudio = Buffer.concat(buffers);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': fullAudio.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      });

      res.send(fullAudio);
    } catch (error) {
      console.error('TTS Error:', error);
      res.status(500).json({ status: 'error', message: 'Text to speech synthesis error' });
    }
  },

  async generateCoverLetter(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { jobTitle, jobDescription, companyName, tone, customResumeText } = req.body;
      if (!jobTitle) return res.status(400).json({ status: 'error', message: 'Job title is required' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const resumeText = customResumeText || user?.resumeText || '';

      if (!resumeText.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Vui lòng cung cấp nội dung CV hoặc cập nhật hồ sơ cá nhân để AI viết thư xin việc phù hợp.'
        });
      }

      const result = await AiService.generateCoverLetter(
        resumeText,
        jobTitle,
        jobDescription || 'Yêu cầu năng động, nhiệt huyết, có chuyên môn và kỹ năng phù hợp.',
        companyName || 'Quý Doanh Nghiệp',
        user?.name || 'Ứng viên',
        tone || 'professional'
      );

      await createNotificationHelper(
        userId,
        'Cover Letter hoàn tất! ✍️',
        `AI đã tạo xong thư xin việc cho vị trí "${jobTitle}" tại "${companyName || 'Doanh nghiệp'}".`,
        'success',
        '/cover-letter'
      );

      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      res.status(500).json({ status: 'error', message: 'Failed to generate cover letter' });
    }
  },

  async extractCvFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Vui lòng chọn tệp CV (PDF, DOCX hoặc TXT)' });
      }

      const extracted = await extractCvDocument({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      });

      res.json({
        status: 'success',
        data: extracted,
      });
    } catch (error: any) {
      console.error('CV Extract error:', error?.message || error);
      res.status(400).json({
        status: 'error',
        message: error?.message || 'Không thể trích xuất văn bản từ tệp CV đã tải lên.',
      });
    }
  },

  async optimizeCV(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { resumeText, targetRole, focusArea } = req.body;
      let textToOptimize = resumeText;

      if (!textToOptimize) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        textToOptimize = user?.resumeText;
      }

      if (!textToOptimize || !textToOptimize.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Vui lòng cung cấp nội dung CV để AI tiến hành tối ưu hóa.',
        });
      }

      const result = await AiService.optimizeCV(
        textToOptimize.trim(),
        targetRole || 'Chuyên viên kỹ thuật',
        focusArea || 'comprehensive'
      );

      await createNotificationHelper(
        userId,
        'Tối ưu hóa CV hoàn tất! ✨',
        `AI đã viết lại và nâng cấp CV theo chuẩn ATS với điểm tác động ${result.impactScore}/100.`,
        'success',
        '/cv-optimizer'
      );

      res.json({ status: 'success', data: result });
    } catch (error: any) {
      if ((req as any).refundCredit) await (req as any).refundCredit();
      console.error('Error optimizing CV:', error);
      res.status(500).json({ status: 'error', message: 'Failed to optimize CV' });
    }
  }
};


