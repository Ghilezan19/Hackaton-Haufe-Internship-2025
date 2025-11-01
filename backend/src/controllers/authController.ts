import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user with free trial (10 reviews)
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        reviewsLeft: 10,
        reviewsUsed: 0,
        totalReviewsAllowed: 10,
        startDate: new Date(),
      },
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        subscription: req.user.subscription,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function upgradePlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { plan } = req.body;

    if (!['pro', 'enterprise'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }

    // Define plan limits
    const planLimits: Record<string, number> = {
      free: 10,
      pro: 1000,
      enterprise: -1, // unlimited
    };

    // Update user subscription
    req.user.subscription.plan = plan;
    req.user.subscription.totalReviewsAllowed = planLimits[plan];
    req.user.subscription.reviewsLeft = planLimits[plan] === -1 ? -1 : planLimits[plan];
    req.user.subscription.reviewsUsed = 0;
    req.user.subscription.status = 'active';
    req.user.subscription.startDate = new Date();
    req.user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await req.user.save();

    res.json({
      message: `Successfully upgraded to ${plan} plan`,
      subscription: req.user.subscription,
    });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
}

export async function createAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, adminSecret } = req.body;

    // Check admin secret (you should set this in env)
    if (adminSecret !== process.env.ADMIN_SECRET) {
      res.status(403).json({ error: 'Invalid admin secret' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create admin user with unlimited reviews
    const admin = await User.create({
      email,
      password,
      name,
      role: 'admin',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        reviewsLeft: -1, // unlimited
        reviewsUsed: 0,
        totalReviewsAllowed: -1, // unlimited
        startDate: new Date(),
      },
    });

    const token = generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        subscription: admin.subscription,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
}

