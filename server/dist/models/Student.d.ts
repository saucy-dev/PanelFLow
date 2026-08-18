import mongoose, { Document } from 'mongoose';
export interface IDomainPreference {
    domainId: mongoose.Types.ObjectId;
    priority: number;
}
export type StudentStatus = 'REGISTERED' | 'IN_QUEUE' | 'ASSIGNED' | 'INTERVIEWING' | 'COMPLETED' | 'CANCELLED';
export interface IStudent extends Document {
    registrationNumber: string;
    name: string;
    email: string;
    branch: string;
    year: number | string;
    phone?: string;
    domainPreferences: IDomainPreference[];
    status: StudentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Student: mongoose.Model<IStudent, {}, {}, {}, mongoose.Document<unknown, {}, IStudent, {}, {}> & IStudent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
