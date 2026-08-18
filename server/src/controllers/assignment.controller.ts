import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignment.service.js';
import { Assignment } from '../models/Assignment.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AssignmentController {
  static async createAssignment(req: Request, res: Response) {
    try {
      const { queueEntryId, panelId, notes } = req.body;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await AssignmentService.assignCandidate({
        queueEntryId,
        panelId,
        notes,
        actor,
      });

      return ApiResponse.success(res, result, 'Candidate assigned successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Assignment failed', error.statusCode || 500);
    }
  }

  static async reassign(req: Request, res: Response) {
    try {
      const assignmentId = req.params.id as string;
      const { newPanelId, notes } = req.body;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await AssignmentService.reassignCandidate({
        assignmentId,
        newPanelId,
        notes,
        actor,
      });

      return ApiResponse.success(res, result, 'Candidate reassigned successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Reassignment failed', error.statusCode || 500);
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const assignmentId = req.params.id as string;
      const { reason, returnToQueue } = req.body;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await AssignmentService.cancelAssignment(
        assignmentId,
        reason,
        returnToQueue !== undefined ? returnToQueue : true,
        actor
      );

      return ApiResponse.success(res, result, 'Assignment cancelled');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Cancellation failed', error.statusCode || 500);
    }
  }

  static async getAllAssignments(req: Request, res: Response) {
    try {
      const assignments = await Assignment.find()
        .populate('studentId')
        .populate({
          path: 'panelId',
          populate: { path: 'interviewerIds' },
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return ApiResponse.success(res, assignments);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch assignments', 500);
    }
  }
}
