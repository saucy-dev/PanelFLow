import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, panelLoginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/panel-login', validate(panelLoginSchema), AuthController.panelLogin);
router.get('/me', optionalAuth, AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
