import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { creditMiddleware } from '../middleware/credit.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.get('/career-roadmap', authenticate, aiController.getActiveRoadmap);
router.post('/career-roadmap', authenticate, creditMiddleware('roadmap'), aiController.generateRoadmap);
router.put('/career-roadmap/:id/progress', authenticate, aiController.updateRoadmapProgress);
router.post('/cv-analyze', authenticate, creditMiddleware('cv'), aiController.analyzeCV);
router.post('/skill-gap', authenticate, aiController.skillGap);
router.post('/upload-cv', authenticate, aiController.uploadCV);
router.post('/extract-cv', upload.single('cvFile'), aiController.extractCvFile);
router.post('/optimize-cv', authenticate, creditMiddleware('cv'), aiController.optimizeCV);
router.get('/tts', aiController.textToSpeech);
router.post('/tts', aiController.textToSpeech);
router.post('/cover-letter', authenticate, aiController.generateCoverLetter);

export default router;

