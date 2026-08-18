import { Request, Response } from 'express';
import { Domain } from '../models/Domain.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class DomainController {
  static async getAllDomains(req: Request, res: Response) {
    try {
      const domains = await Domain.find({ isActive: true }).sort({ name: 1 }).lean();
      return ApiResponse.success(res, domains);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to fetch domains', 500);
    }
  }

  static async createDomain(req: Request, res: Response) {
    try {
      const { name, description, color } = req.body;
      const domain = await Domain.create({ name, description, color });
      return ApiResponse.success(res, domain, 'Domain created successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Failed to create domain', 400);
    }
  }
}
