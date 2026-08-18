import mongoose, { Document, Schema } from 'mongoose';

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface ISessionSettings {
  allowStudentRegistration: boolean;
  allowReassignment: boolean;
  showEstimatedWait: boolean;
  strictPanelAvailability: boolean;
  defaultDurationMinutes: number;
}

export interface IInterviewSession extends Document {
  sessionName: string;
  description?: string;
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  settings: ISessionSettings;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSettingsSchema = new Schema<ISessionSettings>(
  {
    allowStudentRegistration: { type: Boolean, default: true },
    allowReassignment: { type: Boolean, default: true },
    showEstimatedWait: { type: Boolean, default: true },
    strictPanelAvailability: { type: Boolean, default: true },
    defaultDurationMinutes: { type: Number, default: 15 },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    sessionName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED'],
      default: 'ACTIVE',
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    settings: {
      type: SessionSettingsSchema,
      default: () => ({
        allowStudentRegistration: true,
        allowReassignment: true,
        showEstimatedWait: true,
        strictPanelAvailability: true,
        defaultDurationMinutes: 15,
      }),
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
