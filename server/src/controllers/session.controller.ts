import { Request, Response } from 'express';
import { SessionService } from '../services/session.service.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class SessionController {
  static async getActiveSession(req: Request, res: Response) {
    try {
      const session = await SessionService.getActiveSession();
      return ApiResponse.success(res, session);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch session', 500);
    }
  }

  static async updateSession(req: Request, res: Response) {
    try {
      const sessionId = req.params.id as string;
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : { role: 'ADMIN' };
      const session = await SessionService.updateSession(sessionId, req.body, actor);
      return ApiResponse.success(res, session, 'Session updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to update session', 500);
    }
  }

  static async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await InterviewSession.find().sort({ createdAt: -1 });
      return ApiResponse.success(res, sessions);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch sessions', 500);
    }
  }
}
