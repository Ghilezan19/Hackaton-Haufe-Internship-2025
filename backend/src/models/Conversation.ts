import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  topic?: string;
  codeContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [MessageSchema],
    topic: {
      type: String,
    },
    codeContext: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index pentru căutare rapidă
ConversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
