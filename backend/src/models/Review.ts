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
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model<IReview>('Review', reviewSchema);

