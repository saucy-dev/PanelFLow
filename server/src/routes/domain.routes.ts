import { Router } from 'express';
import { DomainController } from '../controllers/domain.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', DomainController.getAllDomains);
router.post('/', authenticate, authorize('ADMIN'), DomainController.createDomain);

export default router;
