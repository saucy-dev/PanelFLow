import mongoose, { Document } from 'mongoose';
export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export interface ISessionSettings {
    allowStudentRegistration: boolean;
    allowReassignment: boolean;
    showEstimatedWait: boolean;
    strictPanelAvailability: boolean;
    defaultDurationMinutes: number;
}
export interface IInterviewSession extends Document {
    sessionName: string;
    description?: string;
    status: SessionStatus;
    startedAt: Date;
    endedAt?: Date | null;
    createdBy?: mongoose.Types.ObjectId;
    settings: ISessionSettings;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InterviewSession: mongoose.Model<IInterviewSession, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewSession, {}, {}> & IInterviewSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
