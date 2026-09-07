import { Router } from 'express';
import { register, login, getMe, verifyEmail } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../schema/auth.schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, getMe);

export default router;
