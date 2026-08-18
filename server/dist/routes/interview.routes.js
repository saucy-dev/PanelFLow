"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_js_1 = require("../controllers/interview.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.post('/:id/start', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), interview_controller_js_1.InterviewController.startInterview);
router.post('/:id/complete', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), interview_controller_js_1.InterviewController.completeInterview);
exports.default = router;
//# sourceMappingURL=interview.routes.js.map