import { Router } from 'express';
import { 
  getJobs, 
  getJobBySlug, 
  applyForJob, 
  getJobMatchBreakdown, 
  chatAboutJob, 
  saveJob, 
  unsaveJob, 
  getSavedJobs, 
  getAppliedJobs 
} from '../controllers/job.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { uploadCV } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getJobs);
router.get('/saved', authenticate, getSavedJobs);
router.get('/applied', authenticate, getAppliedJobs);
router.get('/:slug', optionalAuthenticate, getJobBySlug);

router.post('/:id/apply', authenticate, uploadCV.single('cvFile'), applyForJob);
router.post('/:id/match', authenticate, getJobMatchBreakdown);
router.post('/:id/chat', optionalAuthenticate, chatAboutJob);
router.post('/:id/save', authenticate, saveJob);
router.delete('/:id/save', authenticate, unsaveJob);

export default router;
