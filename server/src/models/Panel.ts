import mongoose, { Document, Schema } from 'mongoose';

export type PanelStatus = 'AVAILABLE' | 'OCCUPIED' | 'PAUSED' | 'OFFLINE';

export interface IPanel extends Document {
  panelCode: string; // e.g. "P1", "P2"
  name: string;      // e.g. "Panel 1 - Technical"
  roomLocation?: string; // e.g. "Lab 301, 3rd Floor"
  interviewerIds: mongoose.Types.ObjectId[];
  status: PanelStatus;
  currentCandidateId?: mongoose.Types.ObjectId | null;
  currentAssignmentId?: mongoose.Types.ObjectId | null;
  statusUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PanelSchema = new Schema<IPanel>(
  {
    panelCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    roomLocation: { type: String, default: '' },
    interviewerIds: [{ type: Schema.Types.ObjectId, ref: 'Interviewer' }],
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'PAUSED', 'OFFLINE'],
      default: 'AVAILABLE',
      required: true,
    },
    currentCandidateId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
    currentAssignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', default: null },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Panel = mongoose.model<IPanel>('Panel', PanelSchema);
