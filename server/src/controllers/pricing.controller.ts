import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

export const getPlans = (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 'plan_advanced',
        name: 'Gói Advanced',
        priceMonthly: 69000,
        priceYearly: 59000,
        isPopular: false,
        features: [
          { name: 'Lộ trình sự nghiệp AI', val: '2 lượt/tháng' },
          { name: 'Luyện phỏng vấn AI (giọng Việt)', val: '10 lượt/tháng' },
          { name: 'Hỏi đáp nội dung JD', val: '100 lượt' },
          { name: 'So khớp việc làm thông minh', val: '10 lượt' },
          { name: 'Phân tích & Tối ưu CV', val: '10 lượt' },
        ]
      },
      {
        id: 'plan_premium',
        name: 'Gói Premium',
        priceMonthly: 129000,
        priceYearly: 99000,
        isPopular: true,
        features: [
          { name: 'Lộ trình sự nghiệp AI', val: 'Không giới hạn' },
          { name: 'Luyện phỏng vấn AI (giọng Việt)', val: 'Không giới hạn' },
          { name: 'Hỏi đáp nội dung JD', val: 'Không giới hạn' },
          { name: 'So khớp việc làm thông minh', val: 'Không giới hạn' },
          { name: 'Phân tích & Tối ưu CV', val: 'Không giới hạn' },
        ]
      }
    ]
  });
};

export const upgradePlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { planId, billingCycle = 'monthly' } = req.body;
    const cleanPlanId = planId?.replace('plan_', '') || 'premium';

    if (!['advanced', 'premium'].includes(cleanPlanId)) {
      return res.status(400).json({ status: 'error', message: 'Gói cước không hợp lệ' });
    }

    const updatedSub = await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: cleanPlanId,
        cvAnalysisUsed: 0,
        roadmapUsed: 0,
        interviewUsed: 0,
        chatUsed: 0,
      },
      update: {
        planId: cleanPlanId,
        cvAnalysisUsed: 0,
        roadmapUsed: 0,
        interviewUsed: 0,
        chatUsed: 0,
        resetAt: new Date(),
      }
    });

    const planName = cleanPlanId === 'premium' ? 'Premium (Không Giới Hạn)' : 'Advanced Pro';
    await createNotificationHelper(
      userId,
      `Nâng cấp thành công gói ${planName}! 💎`,
      `Tài khoản của bạn đã được kích hoạt gói ${planName} (${billingCycle === 'yearly' ? 'Theo năm' : 'Theo tháng'}). Toàn bộ tính năng AI đã được mở khóa.`,
      'success',
      '/pricing'
    );

    res.json({
      status: 'success',
      message: `Chúc mừng bạn đã nâng cấp thành công gói ${planName}!`,
      data: updatedSub
    });
  } catch (error) {
    console.error('Error in upgradePlan:', error);
    res.status(500).json({ status: 'error', message: 'Không thể nâng cấp gói cước' });
  }
};
