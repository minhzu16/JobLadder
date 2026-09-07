import { Router } from 'express';
import { getPlans, upgradePlan } from '../controllers/pricing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPlans);
router.post('/upgrade', authenticate, upgradePlan);

export default router;
