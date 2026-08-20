"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_controller_js_1 = require("../controllers/session.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const session_validator_js_1 = require("../validators/session.validator.js");
const router = (0, express_1.Router)();
// Public routes for TV/Projector display and session discovery
router.get('/active', auth_middleware_js_1.optionalAuth, session_controller_js_1.SessionController.getActiveSession);
router.get('/display', auth_middleware_js_1.optionalAuth, session_controller_js_1.SessionController.getDisplayData);
// Admin-protected routes
router.get('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), session_controller_js_1.SessionController.getAllSessions);
router.patch('/:id', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(session_validator_js_1.updateSessionSchema), session_controller_js_1.SessionController.updateSession);
exports.default = router;
//# sourceMappingURL=session.routes.js.map