"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const Student_js_1 = require("../models/Student.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class StudentController {
    static async lookup(req, res) {
        const rawQuery = req.query.q || req.params.query || req.params.registrationNumber || '';
        const clean = rawQuery.trim();
        if (!clean) {
            return apiResponse_js_1.ApiResponse.error(res, 'Registration number or email query is required', 400);
        }
        const student = await Student_js_1.Student.findOne({
            $or: [
                { registrationNumber: clean.toUpperCase() },
                { email: clean.toLowerCase() },
            ],
        })
            .populate('domainPreferences.domainId')
            .lean();
        if (!student) {
            return apiResponse_js_1.ApiResponse.error(res, 'Student record not found in synced database', 404);
        }
        return apiResponse_js_1.ApiResponse.success(res, student, 'Student record found');
    }
    static async lookupByRegistration(req, res) {
        return StudentController.lookup(req, res);
    }
    static async getStudentById(req, res) {
        const student = await Student_js_1.Student.findById(req.params.id)
            .populate('domainPreferences.domainId')
            .lean();
        if (!student) {
            return apiResponse_js_1.ApiResponse.error(res, 'Student not found', 404);
        }
        return apiResponse_js_1.ApiResponse.success(res, student);
    }
    static async getAllStudents(req, res) {
        const students = await Student_js_1.Student.find()
            .populate('domainPreferences.domainId')
            .sort({ createdAt: -1 })
            .lean();
        return apiResponse_js_1.ApiResponse.success(res, students);
    }
}
exports.StudentController = StudentController;
//# sourceMappingURL=student.controller.js.map