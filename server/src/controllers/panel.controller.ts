import { Request, Response } from 'express';
import { PanelService } from '../services/panel.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PanelController {
  static async getAllPanels(req: Request, res: Response) {
    try {
      const panels = await PanelService.getAllPanels();
      return ApiResponse.success(res, panels);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch panels', 500);
    }
  }

  static async getPanelById(req: Request, res: Response) {
    try {
      const panel = await PanelService.getPanelById(req.params.id as string);
      return ApiResponse.success(res, panel);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Panel not found', error.statusCode || 404);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const actor = req.user ? { id: req.user.userId, role: req.user.role } : undefined;

      const panel = await PanelService.updateStatus(req.params.id as string, status, actor);
      return ApiResponse.success(res, panel, `Panel status updated to ${status}`);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to update panel status', error.statusCode || 500);
    }
  }

  static async createPanel(req: Request, res: Response) {
    try {
      const panel = await PanelService.createPanel(req.body);
      return ApiResponse.success(res, panel, 'Panel created successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to create panel', error.statusCode || 400);
    }
  }

  static async updatePanelDetails(req: Request, res: Response) {
    try {
      const panelId = req.params.id as string;
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;

      const panel = await PanelService.updatePanelDetails(panelId, req.body, actor);
      return ApiResponse.success(res, panel, 'Panel details updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to update panel details', error.statusCode || 400);
    }
  }

  static async addInterviewer(req: Request, res: Response) {
    try {
      const panelId = req.params.id as string;
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;

      const panel = await PanelService.addInterviewer(panelId, req.body, actor);
      return ApiResponse.success(res, panel, 'Interviewer added to panel successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to add interviewer', error.statusCode || 400);
    }
  }

  static async updateInterviewer(req: Request, res: Response) {
    try {
      const interviewerId = req.params.interviewerId as string;
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;

      const result = await PanelService.updateInterviewer(interviewerId, req.body, actor);
      return ApiResponse.success(res, result, 'Interviewer updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to update interviewer', error.statusCode || 400);
    }
  }

  static async removeInterviewer(req: Request, res: Response) {
    try {
      const panelId = req.params.id as string;
      const interviewerId = req.params.interviewerId as string;
      const actor = req.user ? { id: req.user.userId, name: req.user.email, role: req.user.role } : undefined;

      const panel = await PanelService.removeInterviewerFromPanel(panelId, interviewerId, actor);
      return ApiResponse.success(res, panel, 'Interviewer removed from panel successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to remove interviewer', error.statusCode || 400);
    }
  }
}
