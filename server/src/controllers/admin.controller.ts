import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

export const adminController = {
  // 1. Ecosystem KPI & Stats Overview
  async getStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        totalInterviews,
        applicationsWithScore,
        subscriptions,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'EMPLOYER' } }),
        prisma.job.count(),
        prisma.job.count({ where: { isActive: true } }),
        prisma.application.count(),
        prisma.interviewSession.count(),
        prisma.application.findMany({
          where: { matchScore: { not: null } },
          select: { matchScore: true },
        }),
        prisma.userSubscription.findMany({
          select: { planId: true },
        }),
      ]);

      const avgMatchScore = applicationsWithScore.length > 0
        ? Math.round(applicationsWithScore.reduce((sum, a) => sum + (a.matchScore || 0), 0) / applicationsWithScore.length)
        : 72;

      const planStats = {
        free: subscriptions.filter(s => s.planId === 'free').length,
        advanced: subscriptions.filter(s => s.planId === 'advanced').length,
        premium: subscriptions.filter(s => s.planId === 'premium').length,
      };

      res.json({
        status: 'success',
        data: {
          totalUsers,
          totalEmployers,
          totalJobs,
          activeJobs,
          totalApplications,
          totalInterviews,
          avgMatchScore,
          planStats,
        }
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch admin stats' });
    }
  },

  // 2. User Management: list all users
  async getUsers(req: Request, res: Response) {
    try {
      const { q, role } = req.query;

      const where: any = {};
      if (q) {
        where.OR = [
          { name: { contains: String(q) } },
          { email: { contains: String(q) } },
        ];
      }
      if (role && role !== 'ALL') {
        where.role = String(role);
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          phone: true,
          targetRole: true,
          createdAt: true,
          subscription: true,
          _count: {
            select: {
              createdJobs: true,
              applications: true,
              interviews: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ status: 'success', data: users });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
  },

  // 3. Update User Role
  async updateUserRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;

      if (!['USER', 'EMPLOYER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ status: 'error', message: 'Vai trò không hợp lệ' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true }
      });

      await createNotificationHelper(
        id,
        'Cập nhật quyền hạn tài khoản 🛡️',
        `Tài khoản của bạn đã được quản trị viên cấp quyền: ${role}.`,
        'info',
        '/profile'
      );

      res.json({
        status: 'success',
        message: `Đã cập nhật quyền của ${user.name} thành ${role}`,
        data: user
      });
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update user role' });
    }
  },

  // 4. Update User Plan & Credit
  async updateUserPlan(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { planId } = req.body;

      if (!['free', 'advanced', 'premium'].includes(planId)) {
        return res.status(400).json({ status: 'error', message: 'Gói cước không hợp lệ' });
      }

      const subscription = await prisma.userSubscription.upsert({
        where: { userId: id },
        create: {
          userId: id,
          planId,
          cvAnalysisUsed: 0,
          roadmapUsed: 0,
          interviewUsed: 0,
          chatUsed: 0,
        },
        update: {
          planId,
          cvAnalysisUsed: 0,
          roadmapUsed: 0,
          interviewUsed: 0,
          chatUsed: 0,
          resetAt: new Date(),
        }
      });

      await createNotificationHelper(
        id,
        'Quản trị viên đã nâng cấp gói cước cho bạn! 🎁',
        `Tài khoản của bạn đã được chuyển sang gói ${planId.toUpperCase()} với hạn mức AI đầy đủ.`,
        'success',
        '/pricing'
      );

      res.json({
        status: 'success',
        message: `Đã nâng cấp gói của người dùng thành ${planId}`,
        data: subscription
      });
    } catch (error) {
      console.error('Error in updateUserPlan:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update user plan' });
    }
  },

  // 5. Job Moderation: list all jobs across companies
  async getJobs(req: Request, res: Response) {
    try {
      const { q, status } = req.query;

      const where: any = {};
      if (q) {
        where.OR = [
          { title: { contains: String(q) } },
          { location: { contains: String(q) } },
          { company: { name: { contains: String(q) } } },
        ];
      }
      if (status === 'active') where.isActive = true;
      if (status === 'closed') where.isActive = false;

      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: true,
          creator: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { applications: true, savedBy: true }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: 50,
      });

      res.json({ status: 'success', data: jobs });
    } catch (error) {
      console.error('Error in getJobs:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch jobs for moderation' });
    }
  },

  // 6. Toggle Job Status (Approve / Suspend)
  async toggleJobStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const currentJob = await prisma.job.findUnique({ where: { id } });
      if (!currentJob) return res.status(404).json({ status: 'error', message: 'Job not found' });

      const updated = await prisma.job.update({
        where: { id },
        data: { isActive: !currentJob.isActive },
        include: { company: true }
      });

      if (updated.creatorId) {
        await createNotificationHelper(
          updated.creatorId,
          updated.isActive ? 'Tin tuyển dụng đã được duyệt 📢' : 'Tin tuyển dụng đã bị tạm dừng ⏸️',
          `Quản trị viên đã ${updated.isActive ? 'duyệt mở lại' : 'tạm dừng'} tin "${updated.title}".`,
          updated.isActive ? 'success' : 'warning',
          `/employer/jobs/${updated.id}/applications`
        );
      }

      res.json({
        status: 'success',
        message: `Đã ${updated.isActive ? 'kích hoạt' : 'tạm đóng'} tin tuyển dụng thành công`,
        data: updated
      });
    } catch (error) {
      console.error('Error in toggleJobStatus:', error);
      res.status(500).json({ status: 'error', message: 'Failed to toggle job status' });
    }
  },

  // 7. Delete Job
  async deleteJob(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // Delete child relations first
      await prisma.savedJob.deleteMany({ where: { jobId: id } });
      await prisma.application.deleteMany({ where: { jobId: id } });
      await prisma.job.delete({ where: { id } });

      res.json({ status: 'success', message: 'Đã xóa tin tuyển dụng vi phạm thành công' });
    } catch (error) {
      console.error('Error in deleteJob:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete job' });
    }
  }
};
