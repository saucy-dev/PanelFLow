import { Request, Response } from 'express';
export declare class AssignmentController {
    static createAssignment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static reassign(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancel(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllAssignments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
