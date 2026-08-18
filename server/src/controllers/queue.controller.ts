import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class QueueController {
  static async join(req: Request, res: Response) {
    try {
      const actor = req.user
        ? { id: req.user.userId, role: req.user.role }
        : { role: 'STUDENT' };

      const result = await QueueService.joinQueue(req.body, actor);

      return ApiResponse.success(
        res,
        result,
        result.isExisting ? 'Existing queue position retrieved' : 'Successfully joined queue',
        result.isExisting ? 200 : 201
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || 'Failed to join queue',
        error.statusCode || 500
      );
    }
  }

  static async getQueue(req: Request, res: Response) {
    try {
      const sessionId = req.query.sessionId as string;
      const status = req.query.status as string;

      const entries = await QueueService.getQueue(sessionId, status);
      return ApiResponse.success(res, entries);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch queue', error.statusCode || 500);
    }
  }

  static async getQueueStatus(req: Request, res: Response) {
    try {
      const identifier = req.params.identifier as string;
      const result = await QueueService.getStudentQueueStatus(identifier);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Queue entry not found', error.statusCode || 404);
    }
  }

  static async removeFromQueue(req: Request, res: Response) {
    try {
      const queueEntryId = req.params.id as string;
      const { reason } = req.body;
      const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;

      const result = await QueueService.removeFromQueue(queueEntryId, reason, actor);
      return ApiResponse.success(res, result, 'Student removed from queue');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to remove from queue', error.statusCode || 500);
    }
  }

  static async restoreToQueue(req: Request, res: Response) {
    try {
      const queueEntryId = req.params.id as string;
      const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;

      const result = await QueueService.restoreToQueue(queueEntryId, actor);
      return ApiResponse.success(res, result, 'Student restored to queue');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to restore to queue', error.statusCode || 500);
    }
  }
}
