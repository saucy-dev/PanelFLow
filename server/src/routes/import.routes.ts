import { Router } from 'express';
import { ImportController } from '../controllers/import.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { csvImportSchema } from '../validators/session.validator.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.post('/csv', validate(csvImportSchema), ImportController.importCsv);
router.post('/google-sheets', ImportController.fetchGoogleSheet);

export default router;
