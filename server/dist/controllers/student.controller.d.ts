import { Request, Response } from 'express';
export declare class StudentController {
    static lookup(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static lookupByRegistration(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStudentById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllStudents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
