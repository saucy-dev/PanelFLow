import mongoose, { Document } from 'mongoose';
export type UserRole = 'ADMIN' | 'PANEL' | 'STUDENT';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    panelId?: mongoose.Types.ObjectId;
    studentId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
