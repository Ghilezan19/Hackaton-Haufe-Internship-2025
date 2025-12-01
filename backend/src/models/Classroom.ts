import mongoose, { Document, Schema } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  teacherId: mongoose.Types.ObjectId;
  studentIds: mongoose.Types.ObjectId[];
  subject: string;
  grade: number;
  schoolYear: string; // e.g., "2024-2025"
  description?: string;
  inviteCode: string; // Unique code for students to join
  createdAt: Date;
  updatedAt: Date;
}

const classroomSchema = new Schema<IClassroom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
classroomSchema.index({ teacherId: 1 });
classroomSchema.index({ studentIds: 1 });
classroomSchema.index({ inviteCode: 1 });

export const Classroom = mongoose.model<IClassroom>('Classroom', classroomSchema);
