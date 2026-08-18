import mongoose, { Document, Schema } from 'mongoose';

export interface IDomainPreference {
  domainId: mongoose.Types.ObjectId;
  priority: number; // 1, 2, 3, etc.
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

const StudentSchema = new Schema<IStudent>(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    branch: { type: String, required: true, trim: true },
    year: { type: Schema.Types.Mixed, required: true },
    phone: { type: String, default: '' },
    domainPreferences: [
      {
        domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
        priority: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['REGISTERED', 'IN_QUEUE', 'ASSIGNED', 'INTERVIEWING', 'COMPLETED', 'CANCELLED'],
      default: 'REGISTERED',
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
