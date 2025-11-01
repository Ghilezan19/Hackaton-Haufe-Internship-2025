import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export async function checkReviewLimit(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admin has unlimited reviews
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user has reviews left
    const user = req.user;
    
    // Unlimited plan (enterprise)
    if (user.subscription.totalReviewsAllowed === -1) {
      next();
      return;
    }

    // Check reviews left
    if (user.subscription.reviewsLeft <= 0) {
      res.status(403).json({
        error: 'Review limit reached',
        message: 'You have used all your reviews. Please upgrade your plan.',
        subscription: {
          plan: user.subscription.plan,
          reviewsUsed: user.subscription.reviewsUsed,
          reviewsLeft: user.subscription.reviewsLeft,
        },
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking review limit' });
  }
}

