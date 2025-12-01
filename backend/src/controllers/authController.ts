import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role, schoolName, subject, grade } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Validate role
    const validRoles = ['user', 'teacher', 'student', 'parent'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Base user data
    const userData: any = {
      email,
      password,
      name,
      role: userRole,
      subscription: {
        plan: 'free',
        status: 'active',
        reviewsLeft: userRole === 'student' ? 100 : 10,
        reviewsUsed: 0,
        totalReviewsAllowed: userRole === 'student' ? 100 : 10,
        startDate: new Date(),
      },
    };

    // Add role-specific profiles
    if (userRole === 'teacher') {
      userData.teacherProfile = {
        schoolName: schoolName || 'School',
        subject: subject || 'Computer Science',
        classroomIds: [],
      };
    } else if (userRole === 'student') {
      // Generate unique student code for parent linking
      const studentCode = `STU-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      userData.studentProfile = {
        grade: grade || 9,
        studentCode,
      };
    } else if (userRole === 'parent') {
      userData.parentProfile = {
        studentIds: [],
        notifications: true,
      };
    }

    // Create user
    const user = await User.create(userData);

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

    const userResponse: any = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      subscription: req.user.subscription,
      createdAt: req.user.createdAt,
    };

    // Add role-specific profiles
    if (req.user.role === 'teacher' && req.user.teacherProfile) {
      userResponse.teacherProfile = req.user.teacherProfile;
    } else if (req.user.role === 'student' && req.user.studentProfile) {
      userResponse.studentProfile = req.user.studentProfile;
    } else if (req.user.role === 'parent' && req.user.parentProfile) {
      userResponse.parentProfile = req.user.parentProfile;
    }

    res.json({ user: userResponse });
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

/**
 * Link parent to student using student code
 */
export async function linkParentToStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'parent') {
      res.status(403).json({ error: 'Parent role required' });
      return;
    }

    const { studentCode } = req.body;

    if (!studentCode) {
      res.status(400).json({ error: 'Student code is required' });
      return;
    }

    // Find student by code
    const student = await User.findOne({ 
      'studentProfile.studentCode': studentCode,
      role: 'student'
    });

    if (!student) {
      res.status(404).json({ error: 'Invalid student code' });
      return;
    }

    // Check if already linked
    const alreadyLinked = req.user.parentProfile?.studentIds?.some(
      id => id.toString() === student._id.toString()
    );

    if (alreadyLinked) {
      res.status(400).json({ error: 'Student already linked to your account' });
      return;
    }

    // Link parent to student
    if (!req.user.parentProfile) {
      req.user.parentProfile = { studentIds: [], notifications: true };
    }
    req.user.parentProfile.studentIds.push(student._id);
    await req.user.save();

    // Link student to parent
    if (!student.studentProfile) {
      student.studentProfile = { grade: 9, studentCode: '' };
    }
    student.studentProfile.parentId = req.user._id;
    await student.save();

    res.json({
      message: 'Successfully linked to student',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error('Link parent error:', error);
    res.status(500).json({ error: 'Failed to link parent to student' });
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


