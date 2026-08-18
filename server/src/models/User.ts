import mongoose, { Document, Schema } from 'mongoose';

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

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ['ADMIN', 'PANEL', 'STUDENT'],
      default: 'STUDENT',
      required: true,
    },
    panelId: { type: Schema.Types.ObjectId, ref: 'Panel', default: null },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
