"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelController = void 0;
const panel_service_js_1 = require("../services/panel.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class PanelController {
    static async getAllPanels(req, res) {
        try {
            const panels = await panel_service_js_1.PanelService.getAllPanels();
            return apiResponse_js_1.ApiResponse.success(res, panels);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch panels', 500);
        }
    }
    static async getPanelById(req, res) {
        try {
            const panel = await panel_service_js_1.PanelService.getPanelById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, panel);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Panel not found', error.statusCode || 404);
        }
    }
    static async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;
            const panel = await panel_service_js_1.PanelService.updateStatus(req.params.id, status, actor);
            return apiResponse_js_1.ApiResponse.success(res, panel, `Panel status updated to ${status}`);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to update panel status', error.statusCode || 500);
        }
    }
    static async createPanel(req, res) {
        try {
            const panel = await panel_service_js_1.PanelService.createPanel(req.body);
            return apiResponse_js_1.ApiResponse.success(res, panel, 'Panel created successfully', 201);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to create panel', error.statusCode || 400);
        }
    }
    static async updatePanelDetails(req, res) {
        try {
            const panelId = req.params.id;
            const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;
            const panel = await panel_service_js_1.PanelService.updatePanelDetails(panelId, req.body, actor);
            return apiResponse_js_1.ApiResponse.success(res, panel, 'Panel details updated successfully');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to update panel details', error.statusCode || 400);
        }
    }
    static async addInterviewer(req, res) {
        try {
            const panelId = req.params.id;
            const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;
            const panel = await panel_service_js_1.PanelService.addInterviewer(panelId, req.body, actor);
            return apiResponse_js_1.ApiResponse.success(res, panel, 'Interviewer added to panel successfully', 201);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to add interviewer', error.statusCode || 400);
        }
    }
    static async updateInterviewer(req, res) {
        try {
            const interviewerId = req.params.interviewerId;
            const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;
            const result = await panel_service_js_1.PanelService.updateInterviewer(interviewerId, req.body, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, 'Interviewer updated successfully');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to update interviewer', error.statusCode || 400);
        }
    }
    static async removeInterviewer(req, res) {
        try {
            const panelId = req.params.id;
            const interviewerId = req.params.interviewerId;
            const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;
            const panel = await panel_service_js_1.PanelService.removeInterviewerFromPanel(panelId, interviewerId, actor);
            return apiResponse_js_1.ApiResponse.success(res, panel, 'Interviewer removed from panel successfully');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to remove interviewer', error.statusCode || 400);
        }
    }
}
exports.PanelController = PanelController;
//# sourceMappingURL=panel.controller.js.map