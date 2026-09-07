import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createNotificationHelper } from './notification.controller';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, location, industry, experience, workType, workMode, salaryRange } = req.query;
    
    // Filter building using AND array to avoid OR clobbering
    const andConditions: any[] = [{ isActive: true }];
    
    if (keyword && String(keyword).trim()) {
      const kw = String(keyword).trim();
      andConditions.push({
        OR: [
          { title: { contains: kw } },
          { description: { contains: kw } },
          { requirements: { contains: kw } },
          { company: { name: { contains: kw } } },
        ]
      });
    }

    if (location && location !== 'all') {
      andConditions.push({ location: { contains: String(location) } });
    }

    if (industry && industry !== 'all' && industry !== 'Tất cả ngành nghề') {
      andConditions.push({ industry: { contains: String(industry) } });
    }

    if (experience && experience !== 'all' && experience !== 'Tất cả kinh nghiệm') {
      andConditions.push({ experience: { contains: String(experience) } });
    }

    if (workType && workType !== 'all' && workType !== 'Tất cả hình thức') {
      andConditions.push({ workType: { contains: String(workType) } });
    }

    if (workMode && workMode !== 'all' && workMode !== 'Tất cả môi trường') {
      andConditions.push({ workMode: { contains: String(workMode) } });
    }

    if (salaryRange && salaryRange !== 'all' && salaryRange !== 'Tất cả mức lương') {
      const s = String(salaryRange);
      if (s.includes('Dưới 10') || s === '<10m') {
        andConditions.push({ salaryMin: { lte: 10000000 } });
      } else if (s.includes('10 - 20') || s.includes('10–20') || s === '10-20m') {
        andConditions.push({
          OR: [
            { salaryMin: { gte: 10000000, lte: 20000000 } },
            { salaryMax: { gte: 10000000, lte: 25000000 } }
          ]
        });
      } else if (s.includes('20 - 30') || s.includes('20–30') || s === '20-30m') {
        andConditions.push({
          OR: [
            { salaryMin: { gte: 20000000, lte: 30000000 } },
            { salaryMax: { gte: 20000000, lte: 35000000 } }
          ]
        });
      } else if (s.includes('Trên 30') || s === '>30m') {
        andConditions.push({ salaryMax: { gte: 30000000 } });
      }
    }

    const where = { AND: andConditions };

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: { name: true, logoUrl: true, rating: true, industry: true }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: limit,
        skip: skip
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({ 
      status: 'success', 
      data: jobs, 
      total, 
      totalPages, 
      page, 
      limit 
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching jobs' });
  }
};

export const getJobBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    let job = await prisma.job.findUnique({
      where: { slug },
      include: { company: true }
    });

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id: slug },
        include: { company: true }
      });
    }

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    let isSaved = false;
    let isApplied = false;
    const userId = (req as any).user?.userId;

    if (userId) {
      const [saved, applied] = await Promise.all([
        prisma.savedJob.findUnique({
          where: { userId_jobId: { userId, jobId: job.id } }
        }),
        prisma.application.findUnique({
          where: { userId_jobId: { userId, jobId: job.id } }
        })
      ]);
      isSaved = !!saved;
      isApplied = !!applied;
    }

    res.json({ ...job, isSaved, isApplied });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const applyForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const cvUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        cvUrl
      }
    });

    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (job) {
      await createNotificationHelper(
        userId,
        'Ứng tuyển thành công',
        `Bạn đã nộp hồ sơ ứng tuyển vị trí ${job.title} tại ${job.company.name}.`,
        'application',
        '/applied-jobs'
      );
    }

    res.status(201).json({ message: 'Applied successfully', application });
  } catch (error: any) {
    if (req.file) {
      const fs = require('fs');
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'You have already applied for this job' });
    } else {
      res.status(500).json({ message: 'Server error applying for job' });
    }
  }
};

import { AiService } from '../services/ai.service';

export const getJobMatchBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    
    if (!user?.resumeText) {
      res.status(400).json({ message: 'User has no CV uploaded' });
      return;
    }

    const jobDescription = `${job.title}\n${job.description}\n${job.requirements}`;
    const breakdown = await AiService.generateJobMatchBreakdown(user.resumeText, jobDescription);

    res.json({ status: 'success', data: breakdown });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error calculating match breakdown' });
  }
};

export const chatAboutJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    let job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!job) {
      job = await prisma.job.findUnique({
        where: { slug: jobId },
        include: { company: true }
      });
    }

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    let resumeText: string | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      resumeText = user?.resumeText || undefined;
    }

    const jobContext = `VỊ TRÍ: ${job.title}
CÔNG TY: ${job.company.name}
ĐỊA ĐIỂM: ${job.location}
HÌNH THỨC: ${job.workType} (${job.workMode})
KINH NGHIỆM YÊU CẦU: ${job.experience}
MÔ TẢ CÔNG VIỆC:
${job.description}
YÊU CẦU ỨNG VIÊN:
${job.requirements || 'Không nêu chi tiết'}
QUYỀN LỢI:
${job.benefits || 'Theo quy định công ty'}`;

    const reply = await AiService.generateJobContextChat(jobContext, resumeText, message, history || '');
    res.json({ status: 'success', data: { reply } });
  } catch (error) {
    console.error('Error chatting about job:', error);
    res.status(500).json({ message: 'Server error answering question about job' });
  }
};

export const saveJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      job = await prisma.job.findUnique({ where: { slug: jobId } });
    }

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId, jobId: job.id } },
      create: { userId, jobId: job.id },
      update: {}
    });

    res.json({ status: 'success', message: 'Job saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving job' });
  }
};

export const unsaveJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      job = await prisma.job.findUnique({ where: { slug: jobId } });
    }

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    await prisma.savedJob.deleteMany({
      where: { userId, jobId: job.id }
    });

    res.json({ status: 'success', message: 'Job unsaved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error unsaving job' });
  }
};

export const getSavedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { savedAt: 'desc' }
    });

    res.json({ status: 'success', data: savedJobs.map(s => s.job) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching saved jobs' });
  }
};

export const getAppliedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ status: 'success', data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, industry } = req.query;
    const where: any = {};
    if (q && String(q).trim()) where.name = { contains: String(q).trim() };
    if (industry && industry !== 'all' && industry !== 'Tất cả lĩnh vực') where.industry = String(industry);

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { jobs: { where: { isActive: true } } }
        },
        jobs: {
          where: { isActive: true },
          take: 3,
          select: { id: true, title: true, slug: true, location: true, salaryMin: true, salaryMax: true, workType: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.json({ status: 'success', data: companies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching companies' });
  }
};

export const getCompanyBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    let company = await prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { isActive: true },
          orderBy: { postedAt: 'desc' }
        }
      }
    });

    if (!company) {
      company = await prisma.company.findUnique({
        where: { id: slug },
        include: {
          jobs: {
            where: { isActive: true },
            orderBy: { postedAt: 'desc' }
          }
        }
      });
    }

    if (!company) {
      res.status(404).json({ message: 'Không tìm thấy công ty' });
      return;
    }

    res.json({ status: 'success', data: company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching company details' });
  }
};

