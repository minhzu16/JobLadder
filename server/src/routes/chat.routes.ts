import express from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/sessions', authenticate, chatController.createSession);
router.get('/history', authenticate, chatController.getSessions);
router.post('/messages', authenticate, chatController.sendMessage);
router.get('/:id/messages', authenticate, chatController.getMessages);
router.delete('/:id', authenticate, chatController.deleteSession);

export default router;
