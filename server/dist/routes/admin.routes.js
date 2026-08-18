"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'));
router.get('/dashboard', admin_controller_js_1.AdminController.getDashboard);
router.get('/analytics', admin_controller_js_1.AdminController.getAnalytics);
router.get('/events', admin_controller_js_1.AdminController.getEvents);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map