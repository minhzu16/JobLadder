import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        targetRole: true,
        resumeText: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            savedJobs: true,
            applications: true,
            interviews: true,
            roadmaps: true,
            cvAnalyses: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ status: 'success', data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, phone, bio, targetRole, avatarUrl, resumeText } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(targetRole !== undefined && { targetRole }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(resumeText !== undefined && { resumeText }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        targetRole: true,
        resumeText: true,
        role: true,
      }
    });

    res.json({ status: 'success', data: updatedUser, message: 'Cập nhật hồ sơ thành công!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const getUserCVs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    const cvs = await prisma.userCV.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ status: 'success', data: cvs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ status: 'error', message: 'Server error fetching CVs' });
  }
};

export const createUserCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    const { title, extractedText, fileName, fileUrl, isDefault } = req.body;
    if (!title || !extractedText) {
      res.status(400).json({ status: 'error', message: 'Tiêu đề và nội dung CV là bắt buộc' });
      return;
    }

    const count = await prisma.userCV.count({ where: { userId } });
    const makeDefault = isDefault || count === 0;

    if (makeDefault) {
      await prisma.userCV.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { resumeText: extractedText },
      });
    }

    const newCV = await prisma.userCV.create({
      data: {
        userId,
        title,
        extractedText,
        fileName,
        fileUrl,
        isDefault: makeDefault,
      },
    });

    res.json({ status: 'success', data: newCV, message: 'Đã thêm CV mới thành công!' });
  } catch (error) {
    console.error('Error creating CV:', error);
    res.status(500).json({ status: 'error', message: 'Server error creating CV' });
  }
};

export const setDefaultCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cvId = req.params.id as string;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const cv = await prisma.userCV.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      res.status(404).json({ status: 'error', message: 'CV không tồn tại' });
      return;
    }

    await prisma.userCV.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.userCV.update({
      where: { id: cvId },
      data: { isDefault: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { resumeText: cv.extractedText },
    });

    res.json({ status: 'success', data: updated, message: 'Đã đặt làm CV mặc định!' });
  } catch (error) {
    console.error('Error setting default CV:', error);
    res.status(500).json({ status: 'error', message: 'Server error setting default CV' });
  }
};

export const deleteUserCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cvId = req.params.id as string;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const cv = await prisma.userCV.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      res.status(404).json({ status: 'error', message: 'CV không tồn tại' });
      return;
    }

    await prisma.userCV.delete({ where: { id: cvId } });

    if (cv.isDefault) {
      const nextCV = await prisma.userCV.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextCV) {
        await prisma.userCV.update({
          where: { id: nextCV.id },
          data: { isDefault: true },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { resumeText: nextCV.extractedText },
        });
      }
    }

    res.json({ status: 'success', message: 'Đã xóa CV thành công!' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ status: 'error', message: 'Server error deleting CV' });
  }
};

