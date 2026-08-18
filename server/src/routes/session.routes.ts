import { Router } from 'express';
import { SessionController } from '../controllers/session.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateSessionSchema } from '../validators/session.validator.js';

const router = Router();

router.get('/active', SessionController.getActiveSession);
router.get('/', authenticate, authorize('ADMIN'), SessionController.getAllSessions);
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateSessionSchema), SessionController.updateSession);

export default router;
