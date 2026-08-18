import { Request, Response } from 'express';
export declare class DomainController {
    static getAllDomains(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createDomain(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
