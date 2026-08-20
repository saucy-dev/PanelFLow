import mongoose from 'mongoose';
import { QueueEntry, IQueueEntry } from '../models/QueueEntry.js';
import { Student, IStudent } from '../models/Student.js';
import { Domain } from '../models/Domain.js';
import { SessionService } from './session.service.js';
import { EventService } from './event.service.js';
import { emitToSession, emitToAdmin, emitToStudent } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export interface JoinQueueInput {
  sessionId?: string;
  registrationNumber?: string;
  email?: string;
  name?: string;
  branch?: string;
  year?: number | string;
  phone?: string;
  domainPreferences?: Array<{
    domainId: string;
    priority: number;
  }>;
}

export class QueueService {
  /**
   * Register/Lookup Student and Join Live Waiting Queue
   */
  static async joinQueue(input: JoinQueueInput, actor?: { id?: string; name?: string; role?: any }) {
    const session = input.sessionId
      ? await SessionService.getActiveSession()
      : await SessionService.getActiveSession();

    if (session.status !== 'ACTIVE') {
      throw { statusCode: 400, message: 'The interview session is not currently active for registrations.' };
    }

    if (!session.settings.allowStudentRegistration) {
      throw { statusCode: 400, message: 'Student registration is currently closed by the administrator.' };
    }

    const regNo = input.registrationNumber?.trim().toUpperCase();
    const email = input.email?.trim().toLowerCase();

    if (!regNo && !email) {
      throw { statusCode: 400, message: 'Please provide either a Registration Number or Email Address.' };
    }

    // 1. Lookup existing student from synced records (e.g. from Excel/Sheets or previous joins)
    const lookupConditions: any[] = [];
    if (regNo) lookupConditions.push({ registrationNumber: regNo });
    if (email) lookupConditions.push({ email: email });

    let student = await Student.findOne({ $or: lookupConditions });

    // Handle domain preferences
    let formattedPreferences: Array<{ domainId: mongoose.Types.ObjectId; priority: number }> = [];

    if (input.domainPreferences && input.domainPreferences.length > 0) {
      const domainIds = input.domainPreferences.map((p) => new mongoose.Types.ObjectId(p.domainId));
      const validDomains = await Domain.find({ _id: { $in: domainIds } });
      if (validDomains.length > 0) {
        formattedPreferences = input.domainPreferences.map((p) => ({
          domainId: new mongoose.Types.ObjectId(p.domainId),
          priority: p.priority,
        }));
      }
    }

    if (!student) {
      // If student not found in pre-imported records, create them with defaults
      if (formattedPreferences.length === 0) {
        const allDomains = await Domain.find().limit(5);
        formattedPreferences = allDomains.map((d, idx) => ({
          domainId: d._id as mongoose.Types.ObjectId,
          priority: idx + 1,
        }));
      }

      student = await Student.create({
        registrationNumber: regNo || `REG-${Date.now().toString().slice(-4)}`,
        name: input.name?.trim() || (regNo ? `Candidate ${regNo}` : `Candidate ${email?.split('@')[0]}`),
        email: email || `${regNo?.toLowerCase()}@student.college.edu`,
        branch: input.branch?.trim() || 'CSE',
        year: input.year || 1,
        phone: input.phone || '',
        domainPreferences: formattedPreferences,
        status: 'IN_QUEUE',
      });
    } else {
      // Student was found in synced database records!
      // If input provided new details, update them; otherwise keep pre-synced details
      if (input.name?.trim()) student.name = input.name.trim();
      if (email) student.email = email;
      if (regNo) student.registrationNumber = regNo;
      if (input.branch?.trim()) student.branch = input.branch.trim();
      if (input.year) student.year = input.year;
      if (input.phone) student.phone = input.phone;
      if (formattedPreferences.length > 0) {
        student.domainPreferences = formattedPreferences;
      }
      student.status = 'IN_QUEUE';
      await student.save();
    }

    // 2. Prevent Duplicate Queue Entries in Active Session
    const activeEntry = await QueueEntry.findOne({
      sessionId: session._id,
      studentId: student._id,
      status: { $in: ['WAITING', 'ASSIGNED', 'INTERVIEWING'] },
    }).populate('assignedPanelId');

    if (activeEntry) {
      const countAhead = await QueueEntry.countDocuments({
        sessionId: session._id,
        status: 'WAITING',
        queueNumber: { $lt: activeEntry.queueNumber },
      });

      return {
        isExisting: true,
        queueEntry: activeEntry,
        student,
        position: countAhead + 1,
        studentsAhead: countAhead,
        message: `You are already in the queue at position #${activeEntry.queueNumber}.`,
      };
    }

    // 3. Determine Next Queue Number
    const highestEntry = await QueueEntry.findOne({ sessionId: session._id }).sort({ queueNumber: -1 });
    const nextQueueNumber = highestEntry ? highestEntry.queueNumber + 1 : 1;

    // 4. Create Queue Entry
    const queueEntry = await QueueEntry.create({
      sessionId: session._id,
      studentId: student._id,
      queueNumber: nextQueueNumber,
      joinedAt: new Date(),
      status: 'WAITING',
    });

    const populatedEntry = await QueueEntry.findById(queueEntry._id)
      .populate({
        path: 'studentId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .lean();

    // 5. Calculate count of students ahead
    const countAhead = await QueueEntry.countDocuments({
      sessionId: session._id,
      status: 'WAITING',
      queueNumber: { $lt: nextQueueNumber },
    });

    // 6. Log Event
    await EventService.logEvent({
      sessionId: session._id,
      actorId: actor?.id,
      actorName: actor?.name || student.name,
      actorRole: actor?.role || 'STUDENT',
      eventType: 'STUDENT_JOINED_QUEUE',
      entityType: 'QUEUE_ENTRY',
      entityId: queueEntry._id,
      metadata: {
        queueNumber: nextQueueNumber,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
      },
    });

    // 7. Emit Real-time Socket updates
    emitToSession(session._id.toString(), SOCKET_EVENTS.QUEUE_UPDATED, {
      queueEntry: populatedEntry,
      action: 'ADDED',
    });
    emitToAdmin(SOCKET_EVENTS.QUEUE_UPDATED, {
      queueEntry: populatedEntry,
      action: 'ADDED',
    });

    return {
      isExisting: false,
      queueEntry: populatedEntry,
      student,
      position: countAhead + 1,
      studentsAhead: countAhead,
      message: 'Successfully joined the interview queue!',
    };
  }

  /**
   * Get Live Waiting Queue for a Session
   */
  static async getQueue(sessionId?: string, filterStatus?: string) {
    const session = sessionId
      ? { _id: new mongoose.Types.ObjectId(sessionId) }
      : await SessionService.getActiveSession();

    const query: any = { sessionId: session._id };
    if (filterStatus) {
      query.status = filterStatus;
    } else {
      query.status = { $in: ['WAITING', 'ASSIGNED', 'INTERVIEWING'] };
    }

    const entries = await QueueEntry.find(query)
      .sort({ queueNumber: 1 })
      .populate({
        path: 'studentId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .populate({
        path: 'assignedPanelId',
        populate: {
          path: 'interviewerIds',
          populate: { path: 'domains' },
        },
      })
      .lean();

    return entries;
  }

  /**
   * Get Student Queue Status by Registration Number, Email, or Queue ID
   */
  static async getStudentQueueStatus(identifier: string) {
    const session = await SessionService.getActiveSession();

    let query: any = { sessionId: session._id };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query._id = identifier;
    } else {
      const clean = identifier.trim();
      const student = await Student.findOne({
        $or: [
          { registrationNumber: clean.toUpperCase() },
          { email: clean.toLowerCase() },
        ],
      });
      if (!student) {
        throw { statusCode: 404, message: 'Student not found.' };
      }
      query.studentId = student._id;
    }

    const entry = await QueueEntry.findOne(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'studentId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .populate({
        path: 'assignedPanelId',
        populate: {
          path: 'interviewerIds',
          populate: { path: 'domains' },
        },
      })
      .lean();

    if (!entry) {
      throw { statusCode: 404, message: 'No active queue ticket found for this student.' };
    }

    const studentsAhead = await QueueEntry.countDocuments({
      sessionId: session._id,
      status: 'WAITING',
      queueNumber: { $lt: entry.queueNumber },
    });

    return {
      queueEntry: entry,
      studentsAhead,
      estimatedWaitMinutes: studentsAhead * (session.settings.defaultDurationMinutes || 15),
    };
  }

  /**
   * Remove Student from Queue (Admin action)
   */
  static async removeFromQueue(queueEntryId: string, reason?: string, actor?: { id?: string; name?: string; role?: any }) {
    const entry = await QueueEntry.findById(queueEntryId).populate('studentId');
    if (!entry) {
      throw { statusCode: 404, message: 'Queue entry not found.' };
    }

    entry.status = 'REMOVED';
    entry.removedAt = new Date();
    entry.removalReason = reason || 'Removed by coordinator';
    await entry.save();

    await Student.findByIdAndUpdate(entry.studentId, { status: 'CANCELLED' });

    await EventService.logEvent({
      sessionId: entry.sessionId,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'ADMIN',
      eventType: 'STUDENT_REMOVED',
      entityType: 'QUEUE_ENTRY',
      entityId: entry._id,
      metadata: { queueNumber: entry.queueNumber, reason },
    });

    emitToSession(entry.sessionId.toString(), SOCKET_EVENTS.QUEUE_UPDATED, { queueEntry: entry, action: 'REMOVED' });
    emitToStudent((entry.studentId as any)._id.toString(), SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
      status: 'REMOVED',
      reason,
    });

    return entry;
  }

  /**
   * Restore Removed Student to Queue (Admin action)
   */
  static async restoreToQueue(queueEntryId: string, actor?: { id?: string; name?: string; role?: any }) {
    const entry = await QueueEntry.findById(queueEntryId).populate('studentId');
    if (!entry) {
      throw { statusCode: 404, message: 'Queue entry not found.' };
    }

    entry.status = 'WAITING';
    entry.removedAt = null;
    entry.removalReason = '';
    await entry.save();

    await Student.findByIdAndUpdate(entry.studentId, { status: 'IN_QUEUE' });

    await EventService.logEvent({
      sessionId: entry.sessionId,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'ADMIN',
      eventType: 'STUDENT_RESTORED',
      entityType: 'QUEUE_ENTRY',
      entityId: entry._id,
      metadata: { queueNumber: entry.queueNumber },
    });

    emitToSession(entry.sessionId.toString(), SOCKET_EVENTS.QUEUE_UPDATED, { queueEntry: entry, action: 'RESTORED' });
    emitToStudent((entry.studentId as any)._id.toString(), SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
      status: 'WAITING',
    });

    return entry;
  }
}
