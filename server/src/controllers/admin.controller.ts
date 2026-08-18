import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service.js';
import { PanelService } from '../services/panel.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { EventService } from '../services/event.service.js';
import { SessionService } from '../services/session.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  /**
   * Comprehensive admin dashboard aggregated state
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const session = await SessionService.getActiveSession();
      const [queue, panels, analytics, recentEvents] = await Promise.all([
        QueueService.getQueue(session._id.toString()),
        PanelService.getAllPanels(),
        AnalyticsService.getSessionAnalytics(session._id.toString()),
        EventService.getSessionEvents(session._id.toString(), 25),
      ]);

      return ApiResponse.success(res, {
        session,
        queue,
        panels,
        analytics,
        recentEvents,
      });
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to load dashboard data', 500);
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const sessionId = req.query.sessionId as string;
      const analytics = await AnalyticsService.getSessionAnalytics(sessionId);
      return ApiResponse.success(res, analytics);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to calculate analytics', 500);
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const sessionId = (req.query.sessionId as string) || (await SessionService.getActiveSession())._id.toString();
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const events = await EventService.getSessionEvents(sessionId, limit);
      return ApiResponse.success(res, events);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch event logs', 500);
    }
  }
}
