import { Request, Response } from 'express';
export declare class PanelController {
    static getAllPanels(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPanelById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createPanel(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
