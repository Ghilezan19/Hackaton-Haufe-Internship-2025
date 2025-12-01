import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        _id: Types.ObjectId | string;
        email: string;
        name: string;
        role: 'student' | 'teacher' | 'parent';
      };
    }
  }
}

export {};
