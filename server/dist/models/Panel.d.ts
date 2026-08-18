import mongoose, { Document } from 'mongoose';
export type PanelStatus = 'AVAILABLE' | 'OCCUPIED' | 'PAUSED' | 'OFFLINE';
export interface IPanel extends Document {
    panelCode: string;
    name: string;
    roomLocation?: string;
    interviewerIds: mongoose.Types.ObjectId[];
    status: PanelStatus;
    currentCandidateId?: mongoose.Types.ObjectId | null;
    currentAssignmentId?: mongoose.Types.ObjectId | null;
    statusUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Panel: mongoose.Model<IPanel, {}, {}, {}, mongoose.Document<unknown, {}, IPanel, {}, {}> & IPanel & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
