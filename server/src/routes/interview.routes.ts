import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';
import { creditMiddleware } from '../middleware/credit.middleware';

const router = Router();

router.post('/start', authenticate, creditMiddleware('interview'), interviewController.start);
router.post('/:id/answer', authenticate, interviewController.submitAnswer);
router.get('/history', authenticate, interviewController.getHistory);
router.get('/:id', authenticate, interviewController.getSession);

export default router;
