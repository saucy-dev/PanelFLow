import { Router } from 'express';
import { PanelController } from '../controllers/panel.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updatePanelStatusSchema, createPanelSchema } from '../validators/panel.validator.js';

const router = Router();

router.get('/', optionalAuth, PanelController.getAllPanels);
router.get('/:id', optionalAuth, PanelController.getPanelById);
router.post('/', authenticate, authorize('ADMIN'), validate(createPanelSchema), PanelController.createPanel);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'PANEL'), validate(updatePanelStatusSchema), PanelController.updateStatus);

export default router;
