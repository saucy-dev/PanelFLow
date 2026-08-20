import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class StudentController {
  static async lookup(req: Request, res: Response) {
    const rawQuery = (req.query.q as string) || (req.params.query as string) || (req.params.registrationNumber as string) || '';
    const clean = rawQuery.trim();

    if (!clean) {
      return ApiResponse.error(res, 'Registration number or email query is required', 400);
    }

    const student = await Student.findOne({
      $or: [
        { registrationNumber: clean.toUpperCase() },
        { email: clean.toLowerCase() },
      ],
    })
      .populate('domainPreferences.domainId')
      .lean();

    if (!student) {
      return ApiResponse.error(res, 'Student record not found in synced database', 404);
    }

    return ApiResponse.success(res, student, 'Student record found');
  }

  static async lookupByRegistration(req: Request, res: Response) {
    return StudentController.lookup(req, res);
  }

  static async getStudentById(req: Request, res: Response) {
    const student = await Student.findById(req.params.id as string)
      .populate('domainPreferences.domainId')
      .lean();

    if (!student) {
      return ApiResponse.error(res, 'Student not found', 404);
    }

    return ApiResponse.success(res, student);
  }

  static async getAllStudents(req: Request, res: Response) {
    const students = await Student.find()
      .populate('domainPreferences.domainId')
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.success(res, students);
  }
}
