import { Request, Response } from 'express';
export declare class ImportController {
    static importCsv(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static fetchGoogleSheet(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
