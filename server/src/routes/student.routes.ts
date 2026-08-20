import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/lookup', optionalAuth, StudentController.lookup);
router.get('/lookup/:registrationNumber', optionalAuth, StudentController.lookup);
router.get('/:id', optionalAuth, StudentController.getStudentById);
router.get('/', authenticate, authorize('ADMIN'), StudentController.getAllStudents);

export default router;
