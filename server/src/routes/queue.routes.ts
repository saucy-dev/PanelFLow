import { Router } from 'express';
import { QueueController } from '../controllers/queue.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { queueJoinLimiter } from '../middleware/rateLimiter.js';
import { joinQueueSchema, removeQueueSchema } from '../validators/queue.validator.js';

const router = Router();

router.post('/join', queueJoinLimiter, optionalAuth, validate(joinQueueSchema), QueueController.join);
router.get('/', optionalAuth, QueueController.getQueue);
router.get('/:identifier', QueueController.getQueueStatus);
router.post('/:id/remove', authenticate, authorize('ADMIN'), validate(removeQueueSchema), QueueController.removeFromQueue);
router.post('/:id/restore', authenticate, authorize('ADMIN'), QueueController.restoreToQueue);

export default router;
