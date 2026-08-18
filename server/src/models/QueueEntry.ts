import mongoose, { Document, Schema } from 'mongoose';

export type QueueStatus = 'WAITING' | 'ASSIGNED' | 'INTERVIEWING' | 'COMPLETED' | 'CANCELLED' | 'REMOVED';

export interface IQueueEntry extends Document {
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  queueNumber: number; // Immutable FCFS queue number
  joinedAt: Date;
  status: QueueStatus;
  assignedPanelId?: mongoose.Types.ObjectId | null;
  assignedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  removedAt?: Date | null;
  removalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueEntrySchema = new Schema<IQueueEntry>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    queueNumber: { type: Number, required: true, immutable: true }, // NEVER modified after assignment
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['WAITING', 'ASSIGNED', 'INTERVIEWING', 'COMPLETED', 'CANCELLED', 'REMOVED'],
      default: 'WAITING',
      index: true,
    },
    assignedPanelId: { type: Schema.Types.ObjectId, ref: 'Panel', default: null },
    assignedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    removedAt: { type: Date, default: null },
    removalReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness per session & student while active
QueueEntrySchema.index({ sessionId: 1, studentId: 1, status: 1 });
QueueEntrySchema.index({ sessionId: 1, queueNumber: 1 });

export const QueueEntry = mongoose.model<IQueueEntry>('QueueEntry', QueueEntrySchema);
