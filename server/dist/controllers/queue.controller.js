"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueController = void 0;
const queue_service_js_1 = require("../services/queue.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class QueueController {
    static async join(req, res) {
        try {
            const actor = req.user
                ? { id: req.user.userId, role: req.user.role }
                : { role: 'STUDENT' };
            const result = await queue_service_js_1.QueueService.joinQueue(req.body, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, result.isExisting ? 'Existing queue position retrieved' : 'Successfully joined queue', result.isExisting ? 200 : 201);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to join queue', error.statusCode || 500);
        }
    }
    static async getQueue(req, res) {
        try {
            const sessionId = req.query.sessionId;
            const status = req.query.status;
            const entries = await queue_service_js_1.QueueService.getQueue(sessionId, status);
            return apiResponse_js_1.ApiResponse.success(res, entries);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch queue', error.statusCode || 500);
        }
    }
    static async getQueueStatus(req, res) {
        try {
            const identifier = req.params.identifier;
            const result = await queue_service_js_1.QueueService.getStudentQueueStatus(identifier);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Queue entry not found', error.statusCode || 404);
        }
    }
    static async removeFromQueue(req, res) {
        try {
            const queueEntryId = req.params.id;
            const { reason } = req.body;
            const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;
            const result = await queue_service_js_1.QueueService.removeFromQueue(queueEntryId, reason, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, 'Student removed from queue');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to remove from queue', error.statusCode || 500);
        }
    }
    static async restoreToQueue(req, res) {
        try {
            const queueEntryId = req.params.id;
            const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;
            const result = await queue_service_js_1.QueueService.restoreToQueue(queueEntryId, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, 'Student restored to queue');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to restore to queue', error.statusCode || 500);
        }
    }
}
exports.QueueController = QueueController;
//# sourceMappingURL=queue.controller.js.map