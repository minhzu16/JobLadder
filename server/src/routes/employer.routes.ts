import { Router } from 'express';
import { employerController } from '../controllers/employer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/jobs', authenticate, employerController.getMyJobs);
router.post('/jobs', authenticate, employerController.createJob);
router.put('/jobs/:id', authenticate, employerController.updateJob);
router.get('/jobs/:id/applications', authenticate, employerController.getJobApplications);
router.put('/applications/:id/status', authenticate, employerController.updateApplicationStatus);
router.post('/applications/:id/analyze', authenticate, employerController.analyzeApplicant);

export default router;
