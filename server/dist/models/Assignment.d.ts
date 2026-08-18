import mongoose, { Document } from 'mongoose';
export type AssignmentType = 'MANUAL' | 'REASSIGNED';
export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REASSIGNED';
export interface IAssignment extends Document {
    sessionId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    panelId: mongoose.Types.ObjectId;
    assignedBy?: mongoose.Types.ObjectId;
    assignmentType: AssignmentType;
    status: AssignmentStatus;
    notes?: string;
    previousPanelId?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    startedAt?: Date | null;
    completedAt?: Date | null;
    cancelledAt?: Date | null;
    durationMinutes?: number | null;
    updatedAt: Date;
}
export declare const Assignment: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment, {}, {}> & IAssignment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
