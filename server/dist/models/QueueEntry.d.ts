import mongoose, { Document } from 'mongoose';
export type QueueStatus = 'WAITING' | 'ASSIGNED' | 'INTERVIEWING' | 'COMPLETED' | 'CANCELLED' | 'REMOVED';
export interface IQueueEntry extends Document {
    sessionId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    queueNumber: number;
    joinedAt: Date;
    status: QueueStatus;
    assignedPanelId?: mongoose.Types.ObjectId | null;
    assignedAt?: Date | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    removedAt?: Date | null;
    removalReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const QueueEntry: mongoose.Model<IQueueEntry, {}, {}, {}, mongoose.Document<unknown, {}, IQueueEntry, {}, {}> & IQueueEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
