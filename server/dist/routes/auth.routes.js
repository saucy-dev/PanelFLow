"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const auth_validator_js_1 = require("../validators/auth.validator.js");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_js_1.validate)(auth_validator_js_1.loginSchema), auth_controller_js_1.AuthController.login);
router.post('/panel-login', (0, validate_middleware_js_1.validate)(auth_validator_js_1.panelLoginSchema), auth_controller_js_1.AuthController.panelLogin);
router.get('/me', auth_middleware_js_1.optionalAuth, auth_controller_js_1.AuthController.me);
router.post('/logout', auth_controller_js_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map