import { Request, Response } from 'express';
export declare class AdminController {
    /**
     * Comprehensive admin dashboard aggregated state
     */
    static getDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
