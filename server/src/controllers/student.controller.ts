import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class StudentController {
  static async lookupByRegistration(req: Request, res: Response) {
    const regNo = (req.params.registrationNumber as string).trim().toUpperCase();

    const student = await Student.findOne({ registrationNumber: regNo })
      .populate('domainPreferences.domainId')
      .lean();

    if (!student) {
      return ApiResponse.error(res, 'Student record not found', 404);
    }

    return ApiResponse.success(res, student, 'Student found');
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
