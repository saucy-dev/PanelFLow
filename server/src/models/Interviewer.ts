import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewer extends Document {
  name: string;
  email: string;
  domains: mongoose.Types.ObjectId[];
  panelId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewerSchema = new Schema<IInterviewer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    domains: [{ type: Schema.Types.ObjectId, ref: 'Domain' }],
    panelId: { type: Schema.Types.ObjectId, ref: 'Panel', default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Interviewer = mongoose.model<IInterviewer>('Interviewer', InterviewerSchema);
