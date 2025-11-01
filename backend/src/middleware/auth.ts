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

    // Development mode: Allow requests without auth from VS Code extension
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check if request is from localhost (VS Code extension)
      const isLocalhost = req.ip === '127.0.0.1' || 
                         req.ip === '::1' || 
                         req.hostname === 'localhost';
      
      if (isLocalhost && process.env.NODE_ENV !== 'production') {
        // Create/use a test user for VS Code extension
        let testUser = await User.findOne({ email: 'vscode-extension@test.local' });
        
        if (!testUser) {
          // Create test user with unlimited reviews
          testUser = await User.create({
            name: 'VS Code Extension',
            email: 'vscode-extension@test.local',
            password: 'test123', // Won't be used for login
            role: 'admin', // Admin = unlimited reviews
            subscription: {
              plan: 'enterprise',
              reviewsUsed: 0,
              totalReviewsAllowed: -1,
              reviewsLeft: -1
            }
          });
        }
        
        req.user = testUser;
        req.userId = testUser._id.toString();
        next();
        return;
      }
      
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

