import { Router } from 'express';
import { SessionController } from '../controllers/session.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateSessionSchema } from '../validators/session.validator.js';

const router = Router();

// Public routes for TV/Projector display and session discovery
router.get('/active', optionalAuth, SessionController.getActiveSession);
router.get('/display', optionalAuth, SessionController.getDisplayData);

// Admin-protected routes
router.get('/', authenticate, authorize('ADMIN'), SessionController.getAllSessions);
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateSessionSchema), SessionController.updateSession);

export default router;
