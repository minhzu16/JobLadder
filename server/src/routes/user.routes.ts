import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  getUserCVs, 
  createUserCV, 
  setDefaultCV, 
  deleteUserCV 
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Multi-CV routes
router.get('/cvs', authenticate, getUserCVs);
router.post('/cvs', authenticate, createUserCV);
router.put('/cvs/:id/default', authenticate, setDefaultCV);
router.delete('/cvs/:id', authenticate, deleteUserCV);

export default router;

