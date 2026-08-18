"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueueEntry_js_1 = require("../models/QueueEntry.js");
const Panel_js_1 = require("../models/Panel.js");
const Assignment_js_1 = require("../models/Assignment.js");
const session_service_js_1 = require("./session.service.js");
class AnalyticsService {
    static async getSessionAnalytics(sessionId) {
        const session = sessionId
            ? { _id: new mongoose_1.default.Types.ObjectId(sessionId) }
            : await session_service_js_1.SessionService.getActiveSession();
        // 1. Queue counts by status
        const queueStatusCounts = await QueueEntry_js_1.QueueEntry.aggregate([
            { $match: { sessionId: session._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const queueCounts = {
            WAITING: 0,
            ASSIGNED: 0,
            INTERVIEWING: 0,
            COMPLETED: 0,
            CANCELLED: 0,
            REMOVED: 0,
            TOTAL: 0,
        };
        queueStatusCounts.forEach((item) => {
            if (item._id in queueCounts) {
                queueCounts[item._id] = item.count;
            }
            queueCounts.TOTAL += item.count;
        });
        // 2. Panel counts by status
        const panelStatusCounts = await Panel_js_1.Panel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const panelCounts = {
            AVAILABLE: 0,
            OCCUPIED: 0,
            PAUSED: 0,
            OFFLINE: 0,
            TOTAL: 0,
        };
        panelStatusCounts.forEach((item) => {
            if (item._id in panelCounts) {
                panelCounts[item._id] = item.count;
            }
            panelCounts.TOTAL += item.count;
        });
        // 3. Waiting time metrics (minutes between joinedAt and assignedAt)
        const completedOrAssignedEntries = await QueueEntry_js_1.QueueEntry.find({
            sessionId: session._id,
            assignedAt: { $ne: null },
            joinedAt: { $ne: null },
        }).lean();
        let totalWaitMinutes = 0;
        let maxWaitMinutes = 0;
        let validWaitCount = 0;
        completedOrAssignedEntries.forEach((entry) => {
            if (entry.assignedAt && entry.joinedAt) {
                const waitMin = (new Date(entry.assignedAt).getTime() - new Date(entry.joinedAt).getTime()) / (1000 * 60);
                if (waitMin >= 0) {
                    totalWaitMinutes += waitMin;
                    if (waitMin > maxWaitMinutes)
                        maxWaitMinutes = waitMin;
                    validWaitCount++;
                }
            }
        });
        const averageWaitMinutes = validWaitCount > 0 ? Math.round(totalWaitMinutes / validWaitCount) : 0;
        // 4. Interview duration metrics
        const completedAssignments = await Assignment_js_1.Assignment.find({
            sessionId: session._id,
            status: 'COMPLETED',
        }).lean();
        let totalDurationMinutes = 0;
        let completedInterviewCount = completedAssignments.length;
        completedAssignments.forEach((a) => {
            if (a.durationMinutes) {
                totalDurationMinutes += a.durationMinutes;
            }
            else if (a.completedAt && a.createdAt) {
                const dur = (new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60);
                totalDurationMinutes += Math.max(1, Math.round(dur));
            }
        });
        const averageDurationMinutes = completedInterviewCount > 0 ? Math.round(totalDurationMinutes / completedInterviewCount) : 0;
        // 5. Panel Utilization Calculation
        const activePanels = panelCounts.AVAILABLE + panelCounts.OCCUPIED + panelCounts.PAUSED;
        const utilizationRate = activePanels > 0 ? Math.round((panelCounts.OCCUPIED / activePanels) * 100) : 0;
        return {
            queue: queueCounts,
            panels: panelCounts,
            metrics: {
                averageWaitMinutes,
                longestWaitMinutes: Math.round(maxWaitMinutes),
                averageDurationMinutes,
                completedInterviews: queueCounts.COMPLETED,
                panelUtilizationPercentage: utilizationRate,
                peakQueueLength: queueCounts.TOTAL,
            },
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map