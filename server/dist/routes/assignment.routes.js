"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_js_1 = require("../controllers/assignment.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const assignment_validator_js_1 = require("../validators/assignment.validator.js");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(assignment_validator_js_1.createAssignmentSchema), assignment_controller_js_1.AssignmentController.createAssignment);
router.post('/:id/reassign', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(assignment_validator_js_1.reassignSchema), assignment_controller_js_1.AssignmentController.reassign);
router.post('/:id/cancel', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(assignment_validator_js_1.cancelAssignmentSchema), assignment_controller_js_1.AssignmentController.cancel);
router.get('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), assignment_controller_js_1.AssignmentController.getAllAssignments);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map