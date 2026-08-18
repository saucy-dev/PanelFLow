import { Request, Response } from 'express';
import { InterviewService } from '../services/interview.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class InterviewController {
  static async startInterview(req: Request, res: Response) {
    try {
      const panelId = req.params.id as string;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await InterviewService.startInterview(panelId, actor);
      return ApiResponse.success(res, result, 'Interview started');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to start interview', error.statusCode || 500);
    }
  }

  static async completeInterview(req: Request, res: Response) {
    try {
      const panelId = req.params.id as string;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await InterviewService.completeInterview(panelId, actor);
      return ApiResponse.success(res, result, result.message);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to complete interview', error.statusCode || 500);
    }
  }
}
