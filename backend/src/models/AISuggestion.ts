import mongoose, { Document, Schema } from 'mongoose';

export interface IAISuggestion extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  type: 'teaching_tips' | 'progress_summary' | 'parent_summary';
  content: {
    summary: string;
    suggestions: string[];
    strengths: string[];
    areasForImprovement: string[];
    recommendedExercises?: string[];
  };
  basedOnReviews: mongoose.Types.ObjectId[]; // Review IDs used for analysis
  timeframe: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const aiSuggestionSchema = new Schema<IAISuggestion>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['teaching_tips', 'progress_summary', 'parent_summary'],
      required: true,
    },
    content: {
      summary: { type: String, required: true },
      suggestions: [{ type: String }],
      strengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      recommendedExercises: [{ type: String }],
    },
    basedOnReviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    timeframe: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
aiSuggestionSchema.index({ teacherId: 1, studentId: 1 });
aiSuggestionSchema.index({ studentId: 1, type: 1 });
aiSuggestionSchema.index({ createdAt: -1 });

export const AISuggestion = mongoose.model<IAISuggestion>('AISuggestion', aiSuggestionSchema);
