import mongoose from 'mongoose';
import { QueueEntry } from '../models/QueueEntry.js';
import { Panel } from '../models/Panel.js';
import { Assignment } from '../models/Assignment.js';
import { SessionService } from './session.service.js';

export class AnalyticsService {
  static async getSessionAnalytics(sessionId?: string) {
    const session = sessionId
      ? { _id: new mongoose.Types.ObjectId(sessionId) }
      : await SessionService.getActiveSession();

    // 1. Queue counts by status
    const queueStatusCounts = await QueueEntry.aggregate([
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
        (queueCounts as any)[item._id] = item.count;
      }
      queueCounts.TOTAL += item.count;
    });

    // 2. Panel counts by status
    const panelStatusCounts = await Panel.aggregate([
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
        (panelCounts as any)[item._id] = item.count;
      }
      panelCounts.TOTAL += item.count;
    });

    // 3. Waiting time metrics (minutes between joinedAt and assignedAt)
    const completedOrAssignedEntries = await QueueEntry.find({
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
          if (waitMin > maxWaitMinutes) maxWaitMinutes = waitMin;
          validWaitCount++;
        }
      }
    });

    const averageWaitMinutes = validWaitCount > 0 ? Math.round(totalWaitMinutes / validWaitCount) : 0;

    // 4. Interview duration metrics
    const completedAssignments = await Assignment.find({
      sessionId: session._id,
      status: 'COMPLETED',
    }).lean();

    let totalDurationMinutes = 0;
    let completedInterviewCount = completedAssignments.length;

    completedAssignments.forEach((a) => {
      if (a.durationMinutes) {
        totalDurationMinutes += a.durationMinutes;
      } else if (a.completedAt && a.createdAt) {
        const dur = (new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60);
        totalDurationMinutes += Math.max(1, Math.round(dur));
      }
    });

    const averageDurationMinutes =
      completedInterviewCount > 0 ? Math.round(totalDurationMinutes / completedInterviewCount) : 0;

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
