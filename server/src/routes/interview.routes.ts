import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:id/start', authenticate, authorize('ADMIN', 'PANEL'), InterviewController.startInterview);
router.post('/:id/complete', authenticate, authorize('ADMIN', 'PANEL'), InterviewController.completeInterview);

export default router;
