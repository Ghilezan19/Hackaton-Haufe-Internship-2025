import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  filename?: string;
  codeSize: number;
  findings: number;
  overallScore: number;
  tokensUsed: number;
  analysisTime: number;
  classroomId?: mongoose.Types.ObjectId; // If student is in a classroom
  // Store findings details for teacher/parent visibility
  findingsDetails?: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
  }>;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
    },
    filename: String,
    codeSize: {
      type: Number,
      required: true,
    },
    findings: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    analysisTime: {
      type: Number,
      default: 0,
    },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      index: true,
    },
    findingsDetails: [{
      type: { type: String },
      severity: { type: String },
      title: { type: String },
      description: { type: String },
      lineStart: { type: Number },
      lineEnd: { type: Number },
    }],
  },
  {
    timestamps: true,
  }
);

// Additional indexes for educational features
reviewSchema.index({ classroomId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);


