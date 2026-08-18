"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
const interview_service_js_1 = require("../services/interview.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class InterviewController {
    static async startInterview(req, res) {
        try {
            const panelId = req.params.id;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await interview_service_js_1.InterviewService.startInterview(panelId, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, 'Interview started');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to start interview', error.statusCode || 500);
        }
    }
    static async completeInterview(req, res) {
        try {
            const panelId = req.params.id;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await interview_service_js_1.InterviewService.completeInterview(panelId, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, result.message);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to complete interview', error.statusCode || 500);
        }
    }
}
exports.InterviewController = InterviewController;
//# sourceMappingURL=interview.controller.js.map