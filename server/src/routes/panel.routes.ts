import { Router } from 'express';
import { PanelController } from '../controllers/panel.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updatePanelStatusSchema,
  createPanelSchema,
  updatePanelDetailsSchema,
  addInterviewerSchema,
  updateInterviewerSchema,
} from '../validators/panel.validator.js';

const router = Router();

router.get('/', optionalAuth, PanelController.getAllPanels);
router.get('/:id', optionalAuth, PanelController.getPanelById);
router.post('/', authenticate, authorize('ADMIN'), validate(createPanelSchema), PanelController.createPanel);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'PANEL'), validate(updatePanelStatusSchema), PanelController.updateStatus);

// Edit panel details (Name, Location)
router.patch('/:id', authenticate, authorize('ADMIN', 'PANEL'), validate(updatePanelDetailsSchema), PanelController.updatePanelDetails);

// Add / Update / Remove interviewers
router.post('/:id/interviewers', authenticate, authorize('ADMIN', 'PANEL'), validate(addInterviewerSchema), PanelController.addInterviewer);
router.put('/interviewers/:interviewerId', authenticate, authorize('ADMIN', 'PANEL'), validate(updateInterviewerSchema), PanelController.updateInterviewer);
router.delete('/:id/interviewers/:interviewerId', authenticate, authorize('ADMIN', 'PANEL'), PanelController.removeInterviewer);

export default router;
