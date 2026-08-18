import { Response } from 'express';
import { UserRole } from '../models/User.js';
export interface TokenPayload {
    userId: string;
    role: UserRole;
    email: string;
    panelId?: string;
    studentId?: string;
}
export declare const signToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const setAuthCookie: (res: Response, token: string) => void;
export declare const clearAuthCookie: (res: Response) => void;
