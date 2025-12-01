import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Classroom } from '../models/Classroom.js';
import { User } from '../models/User.js';

/**
 * Create a new classroom (Teacher only)
 */
export async function createClassroom(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { name, subject, grade, schoolYear, description } = req.body;

    if (!name || !subject || !grade || !schoolYear) {
      res.status(400).json({ 
        error: 'Name, subject, grade, and school year are required' 
      });
      return;
    }

    // Generate unique invite code
    const inviteCode = `CLASS-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const classroom = await Classroom.create({
      name,
      teacherId: req.user._id,
      subject,
      grade,
      schoolYear,
      description,
      inviteCode,
      studentIds: [],
    });

    // Add classroom to teacher's profile
    if (!req.user.teacherProfile) {
      req.user.teacherProfile = { schoolName: '', subject: '', classroomIds: [] };
    }
    req.user.teacherProfile.classroomIds.push(classroom._id);
    await req.user.save();

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: {
        id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        grade: classroom.grade,
        inviteCode: classroom.inviteCode,
        studentCount: 0,
      },
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
}

/**
 * Get all classrooms for a teacher
 */
export async function getTeacherClassrooms(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const classrooms = await Classroom.find({ teacherId: req.user._id })
      .populate('studentIds', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      classrooms: classrooms.map(c => ({
        id: c._id,
        name: c.name,
        subject: c.subject,
        grade: c.grade,
        schoolYear: c.schoolYear,
        description: c.description,
        inviteCode: c.inviteCode,
        studentCount: c.studentIds.length,
        students: c.studentIds,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
}

/**
 * Get classroom details
 */
export async function getClassroomDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id)
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email studentProfile');

    if (!classroom) {
      res.status(404).json({ error: 'Classroom not found' });
      return;
    }

    // Check access
    const isTeacher = req.user!.role === 'teacher' && 
                     classroom.teacherId._id.toString() === req.user!._id.toString();
    const isStudent = req.user!.role === 'student' && 
                     classroom.studentIds.some((s: any) => s._id.toString() === req.user!._id.toString());

    if (!isTeacher && !isStudent) {
      res.status(403).json({ error: 'Access denied to this classroom' });
      return;
    }

    res.json({
      classroom: {
        id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        grade: classroom.grade,
        schoolYear: classroom.schoolYear,
        description: classroom.description,
        inviteCode: isTeacher ? classroom.inviteCode : undefined,
        teacher: classroom.teacherId,
        students: classroom.studentIds,
        studentCount: classroom.studentIds.length,
        createdAt: classroom.createdAt,
      },
    });
  } catch (error) {
    console.error('Get classroom details error:', error);
    res.status(500).json({ error: 'Failed to fetch classroom details' });
  }
}

/**
 * Join classroom using invite code (Student only)
 */
export async function joinClassroom(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'student') {
      res.status(403).json({ error: 'Student role required' });
      return;
    }

    const { inviteCode } = req.body;

    if (!inviteCode) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }

    const classroom = await Classroom.findOne({ inviteCode });

    if (!classroom) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    // Check if already in classroom
    if (classroom.studentIds.some(id => id.toString() === req.user!._id.toString())) {
      res.status(400).json({ error: 'Already a member of this classroom' });
      return;
    }

    // Add student to classroom
    classroom.studentIds.push(req.user._id);
    await classroom.save();

    // Update student profile
    if (!req.user.studentProfile) {
      req.user.studentProfile = { grade: classroom.grade, studentCode: '' };
    }
    req.user.studentProfile.classroomId = classroom._id;
    await req.user.save();

    res.json({
      message: 'Successfully joined classroom',
      classroom: {
        id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        grade: classroom.grade,
      },
    });
  } catch (error) {
    console.error('Join classroom error:', error);
    res.status(500).json({ error: 'Failed to join classroom' });
  }
}

/**
 * Remove student from classroom (Teacher only)
 */
export async function removeStudentFromClassroom(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { id: classroomId, studentId } = req.params;

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: req.user._id,
    });

    if (!classroom) {
      res.status(404).json({ error: 'Classroom not found or access denied' });
      return;
    }

    // Remove student from classroom
    classroom.studentIds = classroom.studentIds.filter(
      id => id.toString() !== studentId
    );
    await classroom.save();

    // Update student profile
    const student = await User.findById(studentId);
    if (student && student.studentProfile) {
      student.studentProfile.classroomId = undefined;
      await student.save();
    }

    res.json({
      message: 'Student removed from classroom',
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ error: 'Failed to remove student' });
  }
}

/**
 * Delete classroom (Teacher only)
 */
export async function deleteClassroom(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      res.status(403).json({ error: 'Teacher role required' });
      return;
    }

    const { id } = req.params;

    const classroom = await Classroom.findOneAndDelete({
      _id: id,
      teacherId: req.user._id,
    });

    if (!classroom) {
      res.status(404).json({ error: 'Classroom not found or access denied' });
      return;
    }

    // Remove classroom from all students
    await User.updateMany(
      { 'studentProfile.classroomId': id },
      { $unset: { 'studentProfile.classroomId': '' } }
    );

    // Remove from teacher's profile
    if (req.user.teacherProfile) {
      req.user.teacherProfile.classroomIds = req.user.teacherProfile.classroomIds.filter(
        cId => cId.toString() !== id
      );
      await req.user.save();
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
}
