import mongoose, { Document } from 'mongoose';
export interface IInterviewer extends Document {
    name: string;
    email: string;
    domains: mongoose.Types.ObjectId[];
    panelId?: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Interviewer: mongoose.Model<IInterviewer, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewer, {}, {}> & IInterviewer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
