import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import queueRoutes from './queue.routes.js';
import panelRoutes from './panel.routes.js';
import assignmentRoutes from './assignment.routes.js';
import interviewRoutes from './interview.routes.js';
import adminRoutes from './admin.routes.js';
import sessionRoutes from './session.routes.js';
import domainRoutes from './domain.routes.js';
import importRoutes from './import.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/queue', queueRoutes);
router.use('/panels', panelRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/interviews', interviewRoutes);
router.use('/admin', adminRoutes);
router.use('/sessions', sessionRoutes);
router.use('/domains', domainRoutes);
router.use('/import', importRoutes);

export default router;
