import { Request, Response } from 'express';
export declare class SessionController {
    static getActiveSession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getDisplayData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllSessions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
