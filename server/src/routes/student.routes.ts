import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/lookup/:registrationNumber', StudentController.lookupByRegistration);
router.get('/:id', StudentController.getStudentById);
router.get('/', authenticate, authorize('ADMIN'), StudentController.getAllStudents);

export default router;
