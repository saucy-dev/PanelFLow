"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const queue_service_js_1 = require("../services/queue.service.js");
const panel_service_js_1 = require("../services/panel.service.js");
const analytics_service_js_1 = require("../services/analytics.service.js");
const event_service_js_1 = require("../services/event.service.js");
const session_service_js_1 = require("../services/session.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class AdminController {
    /**
     * Comprehensive admin dashboard aggregated state
     */
    static async getDashboard(req, res) {
        try {
            const session = await session_service_js_1.SessionService.getActiveSession();
            const [queue, panels, analytics, recentEvents] = await Promise.all([
                queue_service_js_1.QueueService.getQueue(session._id.toString()),
                panel_service_js_1.PanelService.getAllPanels(),
                analytics_service_js_1.AnalyticsService.getSessionAnalytics(session._id.toString()),
                event_service_js_1.EventService.getSessionEvents(session._id.toString(), 25),
            ]);
            return apiResponse_js_1.ApiResponse.success(res, {
                session,
                queue,
                panels,
                analytics,
                recentEvents,
            });
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to load dashboard data', 500);
        }
    }
    static async getAnalytics(req, res) {
        try {
            const sessionId = req.query.sessionId;
            const analytics = await analytics_service_js_1.AnalyticsService.getSessionAnalytics(sessionId);
            return apiResponse_js_1.ApiResponse.success(res, analytics);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to calculate analytics', 500);
        }
    }
    static async getEvents(req, res) {
        try {
            const sessionId = req.query.sessionId || (await session_service_js_1.SessionService.getActiveSession())._id.toString();
            const limit = parseInt(req.query.limit, 10) || 100;
            const events = await event_service_js_1.EventService.getSessionEvents(sessionId, limit);
            return apiResponse_js_1.ApiResponse.success(res, events);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch event logs', 500);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map