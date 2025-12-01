import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'teacher' | 'student' | 'parent';
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    reviewsLeft: number;
    reviewsUsed: number;
    totalReviewsAllowed: number;
    startDate: Date;
    endDate?: Date;
  };
  // Teacher profile
  teacherProfile?: {
    schoolName: string;
    subject: string;
    classroomIds: mongoose.Types.ObjectId[];
  };
  // Student profile
  studentProfile?: {
    classroomId?: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    grade: number;
    studentCode: string; // Unique code for parent linking
  };
  // Parent profile
  parentProfile?: {
    studentIds: mongoose.Types.ObjectId[];
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'teacher', 'student', 'parent'],
      default: 'user',
    },
    teacherProfile: {
      schoolName: { type: String },
      subject: { type: String },
      classroomIds: [{ type: Schema.Types.ObjectId, ref: 'Classroom' }],
    },
    studentProfile: {
      classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom' },
      parentId: { type: Schema.Types.ObjectId, ref: 'User' },
      grade: { type: Number },
      studentCode: { type: String, unique: true, sparse: true },
    },
    parentProfile: {
      studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      notifications: { type: Boolean, default: true },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
      },
      reviewsLeft: {
        type: Number,
        default: 10, // Free trial: 10 reviews
      },
      reviewsUsed: {
        type: Number,
        default: 0,
      },
      totalReviewsAllowed: {
        type: Number,
        default: 10, // Free: 10, Pro: 1000, Enterprise: unlimited (-1)
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);


