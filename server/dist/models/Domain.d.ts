import mongoose, { Document } from 'mongoose';
export interface IDomain extends Document {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Domain: mongoose.Model<IDomain, {}, {}, {}, mongoose.Document<unknown, {}, IDomain, {}, {}> & IDomain & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
