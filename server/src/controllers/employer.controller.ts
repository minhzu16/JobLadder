import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../services/ai.service';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

const generateSlug = (title: string, company: string): string => {
  const base = `${title}-${company}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
};

export const employerController = {
  // 1. Get all jobs managed by the employer
  async getMyJobs(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      // Fetch jobs created by this user or, if none, all active jobs for demo/admin
      let jobs = await prisma.job.findMany({
        where: { creatorId: userId },
        include: {
          company: true,
          _count: { select: { applications: true, savedBy: true } },
        },
        orderBy: { postedAt: 'desc' }
      });

      // If user hasn't posted any jobs yet, show all jobs so employer can see and manage candidate applications
      if (jobs.length === 0) {
        jobs = await prisma.job.findMany({
          take: 20,
          include: {
            company: true,
            _count: { select: { applications: true, savedBy: true } },
          },
          orderBy: { postedAt: 'desc' }
        });
      }

      res.json({ status: 'success', data: jobs });
    } catch (error) {
      console.error('Error in getMyJobs:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch employer jobs' });
    }
  },

  // 2. Create a new job posting
  async createJob(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const {
        title,
        companyName,
        companyLogoUrl,
        description,
        requirements,
        benefits,
        salaryMin,
        salaryMax,
        salaryCurrency = 'VND',
        location,
        workType = 'Toàn thời gian',
        workMode = 'Tại văn phòng (Onsite)',
        experience = '1-3 năm',
        industry = 'Công nghệ thông tin',
        isActive = true,
      } = req.body;

      if (!title || !companyName || !description || !location) {
        return res.status(400).json({
          status: 'error',
          message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tiêu đề, Tên công ty, Mô tả, Địa điểm)'
        });
      }

      // Find or create Company
      const companySlug = companyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      let company = await prisma.company.findFirst({
        where: {
          OR: [{ name: companyName }, { slug: companySlug }]
        }
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            slug: `${companySlug}-${Date.now().toString(36)}`,
            logoUrl: companyLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=fff`,
            industry,
            workType: workMode,
            rating: 4.8,
            ratingCount: 1,
          }
        });
      }

      const slug = generateSlug(title, companyName);

      const job = await prisma.job.create({
        data: {
          title,
          slug,
          description,
          requirements,
          benefits,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          salaryCurrency,
          location,
          workType,
          workMode,
          experience,
          industry,
          isActive: Boolean(isActive),
          companyId: company.id,
          creatorId: userId,
        },
        include: {
          company: true,
        }
      });

      // Send notification to the employer confirming job publication
      await createNotificationHelper(
        userId,
        'Tin tuyển dụng đã đăng thành công! 📢',
        `Tin tuyển dụng "${title}" tại ${companyName} đã được kích hoạt và sẵn sàng tiếp nhận hồ sơ.`,
        'success',
        `/employer/jobs/${job.id}/applications`
      );

      res.json({ status: 'success', data: job });
    } catch (error) {
      console.error('Error in createJob:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create job posting' });
    }
  },

  // 3. Update existing job
  async updateJob(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const id = req.params.id as string;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const {
        title,
        description,
        requirements,
        benefits,
        salaryMin,
        salaryMax,
        salaryCurrency,
        location,
        workType,
        workMode,
        experience,
        industry,
        isActive,
      } = req.body;

      const job = await prisma.job.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(requirements !== undefined && { requirements }),
          ...(benefits !== undefined && { benefits }),
          ...(salaryMin !== undefined && { salaryMin: salaryMin ? parseInt(salaryMin) : null }),
          ...(salaryMax !== undefined && { salaryMax: salaryMax ? parseInt(salaryMax) : null }),
          ...(salaryCurrency && { salaryCurrency }),
          ...(location && { location }),
          ...(workType && { workType }),
          ...(workMode && { workMode }),
          ...(experience && { experience }),
          ...(industry && { industry }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
        include: { company: true }
      });

      res.json({ status: 'success', data: job });
    } catch (error) {
      console.error('Error in updateJob:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update job' });
    }
  },

  // 4. Get all applications for a specific job
  async getJobApplications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const jobId = req.params.id as string;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          company: true,
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  bio: true,
                  targetRole: true,
                  resumeText: true,
                  avatarUrl: true,
                }
              }
            },
            orderBy: { appliedAt: 'desc' }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ status: 'error', message: 'Job not found' });
      }

      res.json({ status: 'success', data: job });
    } catch (error) {
      console.error('Error in getJobApplications:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch job applications' });
    }
  },

  // 5. Update application status and send real-time notification to applicant
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const applicationId = req.params.id as string;
      const { status, notes } = req.body;

      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const validStatuses = ['pending', 'reviewing', 'interview', 'offered', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Trạng thái ứng tuyển không hợp lệ' });
      }

      const application = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status,
          ...(notes !== undefined && { notes }),
        },
        include: {
          user: true,
          job: {
            include: { company: true }
          }
        }
      });

      // Notification messages mapped to each status
      let notifTitle = '';
      let notifMessage = '';
      let notifType: 'info' | 'success' | 'warning' | 'application' = 'info';

      const companyName = application.job.company.name;
      const jobTitle = application.job.title;

      switch (status) {
        case 'reviewing':
          notifTitle = `Hồ sơ đang được xem xét 📄`;
          notifMessage = `Nhà tuyển dụng từ ${companyName} đang xem xét hồ sơ ứng tuyển của bạn cho vị trí "${jobTitle}".`;
          notifType = 'info';
          break;
        case 'interview':
          notifTitle = `Lời mời phỏng vấn từ ${companyName}! 🎉`;
          notifMessage = `Chúc mừng bạn! Nhà tuyển dụng trân trọng mời bạn tham gia phỏng vấn vị trí "${jobTitle}". Vui lòng chuẩn bị sẵn sàng.`;
          notifType = 'success';
          break;
        case 'offered':
          notifTitle = `Chúc mừng nhận được Thư mời làm việc (Offer)! 🏆`;
          notifMessage = `${companyName} đã chính thức gửi thông báo nhận việc cho vị trí "${jobTitle}". Xin chúc mừng bạn!`;
          notifType = 'success';
          break;
        case 'rejected':
          notifTitle = `Cập nhật trạng thái hồ sơ ứng tuyển 📩`;
          notifMessage = `Cảm ơn bạn đã ứng tuyển vị trí "${jobTitle}" tại ${companyName}. Hiện tại hồ sơ của bạn chưa phù hợp cho đợt tuyển này.`;
          notifType = 'warning';
          break;
        default:
          notifTitle = `Hồ sơ đã được tiếp nhận`;
          notifMessage = `Hồ sơ của bạn cho vị trí "${jobTitle}" đã được gửi tới ${companyName}.`;
          notifType = 'application';
      }

      // Automatically fire real-time notification to the applicant
      await createNotificationHelper(
        application.userId,
        notifTitle,
        notifMessage,
        notifType,
        '/applied-jobs'
      );

      res.json({
        status: 'success',
        data: application,
        message: `Đã cập nhật trạng thái ứng viên thành "${status}" và gửi thông báo thành công.`
      });
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update application status' });
    }
  },

  // 6. AI Match Screening for Applicant
  async analyzeApplicant(req: Request, res: Response) {
    try {
      const applicationId = req.params.id as string;
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          job: true,
        }
      });

      if (!application) {
        return res.status(404).json({ status: 'error', message: 'Application not found' });
      }

      const resumeText = application.user.resumeText;
      if (!resumeText) {
        return res.status(400).json({
          status: 'error',
          message: 'Ứng viên chưa cung cấp nội dung CV để AI phân tích.'
        });
      }

      const jobContext = `VỊ TRÍ: ${application.job.title}\nMÔ TẢ: ${application.job.description}\nYÊU CẦU: ${application.job.requirements || 'N/A'}`;
      const analysis = await AiService.generateJobMatchBreakdown(resumeText, jobContext);

      const matchScore = typeof analysis.totalScore === 'number' ? analysis.totalScore : 75;

      // Update matchScore on application
      await prisma.application.update({
        where: { id: applicationId },
        data: { matchScore }
      });

      res.json({
        status: 'success',
        data: {
          matchScore,
          strengths: analysis.strengths || [],
          gaps: analysis.gaps || [],
        }
      });
    } catch (error) {
      console.error('Error in analyzeApplicant:', error);
      res.status(500).json({ status: 'error', message: 'Failed to analyze applicant' });
    }
  }
};
