import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLAN_LIMITS = {
  free: {
    cv: 3,
    roadmap: 1,
    interview: 3,
    chat: 10
  },
  advanced: {
    cv: 10,
    roadmap: 2,
    interview: 10,
    chat: 100
  },
  premium: {
    cv: -1,
    roadmap: 5,
    interview: 30,
    chat: -1
  }
};

type FeatureType = 'cv' | 'roadmap' | 'interview' | 'chat';

export const creditMiddleware = (feature: FeatureType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      // Find or create subscription
      let sub = await prisma.userSubscription.findUnique({ where: { userId } });
      if (!sub) {
        sub = await prisma.userSubscription.create({ data: { userId, planId: 'free' } });
      }

      // Check if monthly reset is needed
      const now = new Date();
      if (now.getTime() - sub.resetAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
        sub = await prisma.userSubscription.update({
          where: { userId },
          data: {
            cvAnalysisUsed: 0,
            roadmapUsed: 0,
            interviewUsed: 0,
            chatUsed: 0,
            resetAt: now
          }
        });
      }

      const planId = sub.planId as keyof typeof PLAN_LIMITS;
      const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
      const limit = limits[feature];

      if (limit !== -1) {
        let updateCondition: any = {};
        let updateField = '';
        switch (feature) {
          case 'cv': updateCondition = { cvAnalysisUsed: { lt: limit } }; updateField = 'cvAnalysisUsed'; break;
          case 'roadmap': updateCondition = { roadmapUsed: { lt: limit } }; updateField = 'roadmapUsed'; break;
          case 'interview': updateCondition = { interviewUsed: { lt: limit } }; updateField = 'interviewUsed'; break;
          case 'chat': updateCondition = { chatUsed: { lt: limit } }; updateField = 'chatUsed'; break;
        }

        // Atomic Check & Pre-deduct
        const updated = await prisma.userSubscription.updateMany({
          where: { userId, ...updateCondition },
          data: {
            [updateField]: { increment: 1 }
          }
        });

        if (updated.count === 0) {
          return res.status(403).json({
            status: 'error',
            message: 'Bạn đã hết lượt sử dụng tính năng này trong tháng. Vui lòng nâng cấp gói cước.',
            code: 'OUT_OF_CREDIT'
          });
        }
      }

      // We attach the refund function to be called if the controller action FAILS
      (req as any).refundCredit = async () => {
        if (limit === -1) return;
        let updateData = {};
        switch (feature) {
          case 'cv': updateData = { cvAnalysisUsed: { decrement: 1 } }; break;
          case 'roadmap': updateData = { roadmapUsed: { decrement: 1 } }; break;
          case 'interview': updateData = { interviewUsed: { decrement: 1 } }; break;
          case 'chat': updateData = { chatUsed: { decrement: 1 } }; break;
        }
        await prisma.userSubscription.update({ where: { userId }, data: updateData });
      };

      next();
    } catch (error) {
      console.error('Credit check error:', error);
      res.status(500).json({ status: 'error', message: 'Failed to check credits' });
    }
  };
};
