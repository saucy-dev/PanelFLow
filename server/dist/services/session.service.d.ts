import { IInterviewSession } from '../models/InterviewSession.js';
export declare class SessionService {
    static getActiveSession(): Promise<IInterviewSession>;
    static updateSession(sessionId: string, updateData: any, actor: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<import("mongoose").Document<unknown, {}, IInterviewSession, {}, {}> & IInterviewSession & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
