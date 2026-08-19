"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const panel_controller_js_1 = require("../controllers/panel.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const panel_validator_js_1 = require("../validators/panel.validator.js");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_js_1.optionalAuth, panel_controller_js_1.PanelController.getAllPanels);
router.get('/:id', auth_middleware_js_1.optionalAuth, panel_controller_js_1.PanelController.getPanelById);
router.post('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), (0, validate_middleware_js_1.validate)(panel_validator_js_1.createPanelSchema), panel_controller_js_1.PanelController.createPanel);
router.patch('/:id/status', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), (0, validate_middleware_js_1.validate)(panel_validator_js_1.updatePanelStatusSchema), panel_controller_js_1.PanelController.updateStatus);
// Edit panel details (Name, Location)
router.patch('/:id', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), (0, validate_middleware_js_1.validate)(panel_validator_js_1.updatePanelDetailsSchema), panel_controller_js_1.PanelController.updatePanelDetails);
// Add / Update / Remove interviewers
router.post('/:id/interviewers', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), (0, validate_middleware_js_1.validate)(panel_validator_js_1.addInterviewerSchema), panel_controller_js_1.PanelController.addInterviewer);
router.put('/interviewers/:interviewerId', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), (0, validate_middleware_js_1.validate)(panel_validator_js_1.updateInterviewerSchema), panel_controller_js_1.PanelController.updateInterviewer);
router.delete('/:id/interviewers/:interviewerId', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN', 'PANEL'), panel_controller_js_1.PanelController.removeInterviewer);
exports.default = router;
//# sourceMappingURL=panel.routes.js.map