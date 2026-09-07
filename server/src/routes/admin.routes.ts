import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, adminController.getStats);
router.get('/users', authenticate, adminController.getUsers);
router.put('/users/:id/role', authenticate, adminController.updateUserRole);
router.put('/users/:id/plan', authenticate, adminController.updateUserPlan);
router.get('/jobs', authenticate, adminController.getJobs);
router.put('/jobs/:id/toggle-status', authenticate, adminController.toggleJobStatus);
router.delete('/jobs/:id', authenticate, adminController.deleteJob);

export default router;
