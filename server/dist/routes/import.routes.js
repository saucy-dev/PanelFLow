"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const import_controller_js_1 = require("../controllers/import.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const session_validator_js_1 = require("../validators/session.validator.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'));
router.post('/csv', (0, validate_middleware_js_1.validate)(session_validator_js_1.csvImportSchema), import_controller_js_1.ImportController.importCsv);
router.post('/google-sheets', import_controller_js_1.ImportController.fetchGoogleSheet);
exports.default = router;
//# sourceMappingURL=import.routes.js.map