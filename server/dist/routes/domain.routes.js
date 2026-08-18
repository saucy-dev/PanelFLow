"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const domain_controller_js_1 = require("../controllers/domain.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/', domain_controller_js_1.DomainController.getAllDomains);
router.post('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), domain_controller_js_1.DomainController.createDomain);
exports.default = router;
//# sourceMappingURL=domain.routes.js.map