import { Request, Response } from 'express';
export declare class PanelController {
    static getAllPanels(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPanelById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createPanel(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updatePanelDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static addInterviewer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateInterviewer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeInterviewer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
