"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_js_1 = require("../controllers/student.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/lookup', auth_middleware_js_1.optionalAuth, student_controller_js_1.StudentController.lookup);
router.get('/lookup/:registrationNumber', auth_middleware_js_1.optionalAuth, student_controller_js_1.StudentController.lookup);
router.get('/:id', auth_middleware_js_1.optionalAuth, student_controller_js_1.StudentController.getStudentById);
router.get('/', auth_middleware_js_1.authenticate, (0, auth_middleware_js_1.authorize)('ADMIN'), student_controller_js_1.StudentController.getAllStudents);
exports.default = router;
//# sourceMappingURL=student.routes.js.map