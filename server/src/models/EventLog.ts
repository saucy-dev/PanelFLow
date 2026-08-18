import mongoose, { Document, Schema } from 'mongoose';

export type EventType =
  | 'STUDENT_JOINED_QUEUE'
  | 'STUDENT_ASSIGNED'
  | 'STUDENT_REASSIGNED'
  | 'STUDENT_REMOVED'
  | 'STUDENT_RESTORED'
  | 'PANEL_STATUS_CHANGED'
  | 'INTERVIEW_STARTED'
  | 'INTERVIEW_COMPLETED'
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'DATA_IMPORTED'
  | 'ASSIGNMENT_CANCELLED';

export type EntityType = 'QUEUE_ENTRY' | 'PANEL' | 'STUDENT' | 'ASSIGNMENT' | 'SESSION' | 'DOMAIN' | 'INTERVIEWER';

export interface IEventLog extends Document {
  sessionId: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId | null;
  actorRole: 'ADMIN' | 'PANEL' | 'STUDENT' | 'SYSTEM';
  actorName?: string;
  eventType: EventType;
  entityType: EntityType;
  entityId?: mongoose.Types.ObjectId | string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const EventLogSchema = new Schema<IEventLog>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: {
      type: String,
      enum: ['ADMIN', 'PANEL', 'STUDENT', 'SYSTEM'],
      default: 'SYSTEM',
      required: true,
    },
    actorName: { type: String, default: '' },
    eventType: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const EventLog = mongoose.model<IEventLog>('EventLog', EventLogSchema);
