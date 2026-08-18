import { Request, Response } from 'express';
export declare class InterviewController {
    static startInterview(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static completeInterview(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
