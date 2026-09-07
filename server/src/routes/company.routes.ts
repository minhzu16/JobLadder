import { Router } from 'express';
import { getCompanies, getCompanyBySlug } from '../controllers/job.controller';

const router = Router();

router.get('/', getCompanies);
router.get('/:slug', getCompanyBySlug);

export default router;
