import { Request, Response } from 'express';
export declare class QueueController {
    static join(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getQueue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getQueueStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeFromQueue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static restoreToQueue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
