import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);
router.get('/events', AdminController.getEvents);

export default router;
