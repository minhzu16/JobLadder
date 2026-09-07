import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLAN_LIMITS = {
  free: { cv: 3, roadmap: 1, interview: 3, chat: 10 },
  advanced: { cv: 10, roadmap: 2, interview: 10, chat: 100 },
  premium: { cv: -1, roadmap: 5, interview: 30, chat: -1 }
};

export const dashboardController = {
  async getDashboardData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          cvAnalyses: {
            orderBy: { createdAt: 'asc' },
            select: { id: true, score: true, createdAt: true }
          },
          roadmaps: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          interviews: {
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { id: true, jobTitle: true, overallScore: true, status: true, createdAt: true }
          }
        }
      });

      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

      let planId = 'free';
      let limits = PLAN_LIMITS.free;
      let subscription = user.subscription;

      if (!subscription) {
        subscription = await prisma.userSubscription.create({ data: { userId, planId: 'free' } });
      } else {
        planId = subscription.planId;
        limits = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
      }

      const dashboardData = {
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          resumeReady: !!user.resumeText
        },
        subscription: {
          planId,
          usage: {
            cv: { used: subscription.cvAnalysisUsed, limit: limits.cv },
            roadmap: { used: subscription.roadmapUsed, limit: limits.roadmap },
            interview: { used: subscription.interviewUsed, limit: limits.interview },
            chat: { used: subscription.chatUsed, limit: limits.chat },
          },
          resetAt: subscription.resetAt
        },
        cvScores: user.cvAnalyses,
        latestRoadmap: user.roadmaps[0] ? {
          id: user.roadmaps[0].id,
          goal: user.roadmaps[0].goal,
          createdAt: user.roadmaps[0].createdAt
        } : null,
        recentInterviews: user.interviews
      };

      res.json({ status: 'success', data: dashboardData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard data' });
    }
  }
};
