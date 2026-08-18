import { Response } from 'express';
export declare class ApiResponse {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response<any, Record<string, any>>;
    static error(res: Response, message?: string, statusCode?: number, errors?: any): Response<any, Record<string, any>>;
}
