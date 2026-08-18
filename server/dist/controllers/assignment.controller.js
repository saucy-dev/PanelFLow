"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const assignment_service_js_1 = require("../services/assignment.service.js");
const Assignment_js_1 = require("../models/Assignment.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class AssignmentController {
    static async createAssignment(req, res) {
        try {
            const { queueEntryId, panelId, notes } = req.body;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await assignment_service_js_1.AssignmentService.assignCandidate({
                queueEntryId,
                panelId,
                notes,
                actor,
            });
            return apiResponse_js_1.ApiResponse.success(res, result, 'Candidate assigned successfully', 201);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Assignment failed', error.statusCode || 500);
        }
    }
    static async reassign(req, res) {
        try {
            const assignmentId = req.params.id;
            const { newPanelId, notes } = req.body;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await assignment_service_js_1.AssignmentService.reassignCandidate({
                assignmentId,
                newPanelId,
                notes,
                actor,
            });
            return apiResponse_js_1.ApiResponse.success(res, result, 'Candidate reassigned successfully');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Reassignment failed', error.statusCode || 500);
        }
    }
    static async cancel(req, res) {
        try {
            const assignmentId = req.params.id;
            const { reason, returnToQueue } = req.body;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await assignment_service_js_1.AssignmentService.cancelAssignment(assignmentId, reason, returnToQueue !== undefined ? returnToQueue : true, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, 'Assignment cancelled');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Cancellation failed', error.statusCode || 500);
        }
    }
    static async getAllAssignments(req, res) {
        try {
            const assignments = await Assignment_js_1.Assignment.find()
                .populate('studentId')
                .populate({
                path: 'panelId',
                populate: { path: 'interviewerIds' },
            })
                .sort({ createdAt: -1 })
                .limit(100)
                .lean();
            return apiResponse_js_1.ApiResponse.success(res, assignments);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch assignments', 500);
        }
    }
}
exports.AssignmentController = AssignmentController;
//# sourceMappingURL=assignment.controller.js.map