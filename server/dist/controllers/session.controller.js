"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const session_service_js_1 = require("../services/session.service.js");
const queue_service_js_1 = require("../services/queue.service.js");
const panel_service_js_1 = require("../services/panel.service.js");
const InterviewSession_js_1 = require("../models/InterviewSession.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class SessionController {
    static async getActiveSession(req, res) {
        try {
            const session = await session_service_js_1.SessionService.getActiveSession();
            return apiResponse_js_1.ApiResponse.success(res, session);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch session', 500);
        }
    }
    static async getDisplayData(req, res) {
        try {
            const session = await session_service_js_1.SessionService.getActiveSession();
            const [queue, panels] = await Promise.all([
                queue_service_js_1.QueueService.getQueue(session._id.toString()),
                panel_service_js_1.PanelService.getAllPanels(),
            ]);
            return apiResponse_js_1.ApiResponse.success(res, {
                session,
                queue,
                panels,
            });
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch display data', 500);
        }
    }
    static async updateSession(req, res) {
        try {
            const sessionId = req.params.id;
            const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : { role: 'ADMIN' };
            const session = await session_service_js_1.SessionService.updateSession(sessionId, req.body, actor);
            return apiResponse_js_1.ApiResponse.success(res, session, 'Session updated successfully');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to update session', 500);
        }
    }
    static async getAllSessions(req, res) {
        try {
            const sessions = await InterviewSession_js_1.InterviewSession.find().sort({ createdAt: -1 });
            return apiResponse_js_1.ApiResponse.success(res, sessions);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch sessions', 500);
        }
    }
}
exports.SessionController = SessionController;
//# sourceMappingURL=session.controller.js.map