import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../services/ai.service';

const prisma = new PrismaClient();

export const chatController = {
  // Create a new chat session
  async createSession(req: Request, res: Response) {
    try {
      // Allow anonymous sessions by skipping user check, but here we require user
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: 'Đoạn chat mới'
        }
      });
      res.json({ status: 'success', data: session });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get user's chat history
  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ status: 'success', data: sessions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Send a message and get AI response
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const { sessionId, content } = req.body;
      if (!sessionId || !content) {
        return res.status(400).json({ status: 'error', message: 'Missing fields' });
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content
        }
      });

      // Get past messages for context (latest 10)
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      messages.reverse(); // put back in chronological order
      const historyStr = messages.map(m => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`).join('\n');

      // Check if it's the first message to update title
      if (messages.length === 1) {
        const newTitle = await AiService.generateChatTitle(content);
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title: newTitle }
        });
      }

      // Call AI Service
      const aiResponse = await AiService.generateChatResponse(content, historyStr);

      // Save AI message (save the text message)
      const savedAiMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: aiResponse.message || 'Xin lỗi, có lỗi xảy ra.'
        }
      });

      // Return both the saved message and the action trigger for the frontend
      res.json({ 
        status: 'success', 
        data: {
          ...savedAiMessage,
          action: aiResponse.action,
          payload: aiResponse.payload
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get messages for a session
  async getMessages(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: id },
        orderBy: { createdAt: 'asc' }
      });
      res.json({ status: 'success', data: messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Hard Delete a chat session and all its messages (prevent DB clutter)
  async deleteSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const id = req.params.id as string;
      
      const session = await prisma.chatSession.findUnique({ where: { id } });
      if (!session || session.userId !== userId) {
        return res.status(404).json({ status: 'error', message: 'Session not found' });
      }

      // Hard delete messages first (cascade)
      await prisma.chatMessage.deleteMany({ where: { sessionId: id } });
      // Delete session
      await prisma.chatSession.delete({ where: { id } });

      res.json({ status: 'success', message: 'Session deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
