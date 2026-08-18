import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAssignmentSchema, reassignSchema, cancelAssignmentSchema } from '../validators/assignment.validator.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), validate(createAssignmentSchema), AssignmentController.createAssignment);
router.post('/:id/reassign', authenticate, authorize('ADMIN'), validate(reassignSchema), AssignmentController.reassign);
router.post('/:id/cancel', authenticate, authorize('ADMIN'), validate(cancelAssignmentSchema), AssignmentController.cancel);
router.get('/', authenticate, authorize('ADMIN'), AssignmentController.getAllAssignments);

export default router;
