import mongoose, { Document, Schema } from 'mongoose';

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

const AssignmentSchema = new Schema<IAssignment>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    panelId: { type: Schema.Types.ObjectId, ref: 'Panel', required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    assignmentType: {
      type: String,
      enum: ['MANUAL', 'REASSIGNED'],
      default: 'MANUAL',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'REASSIGNED'],
      default: 'ACTIVE',
      required: true,
      index: true,
    },
    notes: { type: String, default: '' },
    previousPanelId: { type: Schema.Types.ObjectId, ref: 'Panel', default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
