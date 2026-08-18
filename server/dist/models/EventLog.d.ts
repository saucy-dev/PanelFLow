import mongoose, { Document } from 'mongoose';
export type EventType = 'STUDENT_JOINED_QUEUE' | 'STUDENT_ASSIGNED' | 'STUDENT_REASSIGNED' | 'STUDENT_REMOVED' | 'STUDENT_RESTORED' | 'PANEL_STATUS_CHANGED' | 'INTERVIEW_STARTED' | 'INTERVIEW_COMPLETED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'DATA_IMPORTED' | 'ASSIGNMENT_CANCELLED';
export type EntityType = 'QUEUE_ENTRY' | 'PANEL' | 'STUDENT' | 'ASSIGNMENT' | 'SESSION' | 'DOMAIN' | 'INTERVIEWER';
export interface IEventLog extends Document {
    sessionId: mongoose.Types.ObjectId;
    actorId?: mongoose.Types.ObjectId | null;
    actorRole: 'ADMIN' | 'PANEL' | 'STUDENT' | 'SYSTEM';
    actorName?: string;
    eventType: EventType;
    entityType: EntityType;
    entityId?: mongoose.Types.ObjectId | string | null;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const EventLog: mongoose.Model<IEventLog, {}, {}, {}, mongoose.Document<unknown, {}, IEventLog, {}, {}> & IEventLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
