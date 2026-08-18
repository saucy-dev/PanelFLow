import mongoose from 'mongoose';
import { Panel } from '../models/Panel.js';
import { QueueEntry } from '../models/QueueEntry.js';
import { Assignment } from '../models/Assignment.js';
import { Student } from '../models/Student.js';
import { SessionService } from './session.service.js';
import { EventService } from './event.service.js';
import { emitToSession, emitToAdmin, emitToPanel, emitToStudent } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export class InterviewService {
  /**
   * Start Interview (moves status from ASSIGNED -> INTERVIEWING)
   */
  static async startInterview(panelId: string, actor?: { id?: string; name?: string; role?: any }) {
    const session = await SessionService.getActiveSession();

    const panel = await Panel.findById(panelId)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .populate({
        path: 'currentCandidateId',
        populate: { path: 'domainPreferences.domainId' },
      });

    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    if (!panel.currentCandidateId) {
      throw { statusCode: 400, message: 'No candidate currently assigned to this panel.' };
    }

    const studentId = (panel.currentCandidateId as any)._id;

    // Update QueueEntry
    const queueEntry = await QueueEntry.findOne({
      sessionId: session._id,
      studentId,
      status: 'ASSIGNED',
    });

    if (queueEntry) {
      queueEntry.status = 'INTERVIEWING';
      queueEntry.startedAt = new Date();
      await queueEntry.save();
    }

    // Update Assignment
    const assignment = await Assignment.findOne({
      sessionId: session._id,
      studentId,
      panelId: panel._id,
      status: 'ACTIVE',
    });

    if (assignment) {
      assignment.startedAt = new Date();
      await assignment.save();
    }

    await Student.findByIdAndUpdate(studentId, { status: 'INTERVIEWING' });

    await EventService.logEvent({
      sessionId: session._id,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'PANEL',
      eventType: 'INTERVIEW_STARTED',
      entityType: 'PANEL',
      entityId: panel._id,
      metadata: {
        panelCode: panel.panelCode,
        studentName: (panel.currentCandidateId as any).name,
      },
    });

    const populatedEntry = queueEntry
      ? await QueueEntry.findById(queueEntry._id)
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
          .lean()
      : null;

    emitToSession(session._id.toString(), SOCKET_EVENTS.INTERVIEW_STARTED, {
      panel,
      queueEntry: populatedEntry,
    });
    emitToAdmin(SOCKET_EVENTS.INTERVIEW_STARTED, { panel, queueEntry: populatedEntry });
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, panel);
    emitToStudent(studentId.toString(), SOCKET_EVENTS.STUDENT_STATUS_UPDATED, { status: 'INTERVIEWING' });

    return { panel, queueEntry: populatedEntry };
  }

  /**
   * Complete Interview (frees panel back to AVAILABLE and marks student COMPLETED)
   */
  static async completeInterview(panelId: string, actor?: { id?: string; name?: string; role?: any }) {
    const session = await SessionService.getActiveSession();

    const panel = await Panel.findById(panelId);
    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    if (!panel.currentCandidateId) {
      // If panel is already available, just return
      return { panel, message: 'Panel is already available.' };
    }

    const studentId = panel.currentCandidateId;
    const now = new Date();

    // 1. Update Assignment
    const assignment = await Assignment.findOne({
      sessionId: session._id,
      studentId,
      panelId: panel._id,
      status: 'ACTIVE',
    });

    let durationMinutes = 0;
    if (assignment) {
      assignment.status = 'COMPLETED';
      assignment.completedAt = now;
      const start = assignment.startedAt || assignment.createdAt;
      durationMinutes = Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
      assignment.durationMinutes = durationMinutes;
      await assignment.save();
    }

    // 2. Update QueueEntry
    const queueEntry = await QueueEntry.findOne({
      sessionId: session._id,
      studentId,
      status: { $in: ['ASSIGNED', 'INTERVIEWING'] },
    });

    if (queueEntry) {
      queueEntry.status = 'COMPLETED';
      queueEntry.completedAt = now;
      await queueEntry.save();
    }

    // 3. Update Student
    const student = await Student.findByIdAndUpdate(
      studentId,
      { status: 'COMPLETED' },
      { new: true }
    );

    // 4. Free Panel back to AVAILABLE atomically
    panel.status = 'AVAILABLE';
    panel.currentCandidateId = null;
    panel.currentAssignmentId = null;
    panel.statusUpdatedAt = now;
    await panel.save();

    const populatedPanel = await Panel.findById(panel._id)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .lean();

    // 5. Log audit event
    await EventService.logEvent({
      sessionId: session._id,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'PANEL',
      eventType: 'INTERVIEW_COMPLETED',
      entityType: 'PANEL',
      entityId: panel._id,
      metadata: {
        panelCode: panel.panelCode,
        studentName: student?.name,
        durationMinutes,
      },
    });

    // 6. Broadcast across all relevant channels
    emitToSession(session._id.toString(), SOCKET_EVENTS.INTERVIEW_COMPLETED, {
      panel: populatedPanel,
      studentId,
      durationMinutes,
    });
    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.INTERVIEW_COMPLETED, {
      panel: populatedPanel,
      student,
      durationMinutes,
    });
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToStudent(studentId.toString(), SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
      status: 'COMPLETED',
      durationMinutes,
    });

    return {
      success: true,
      panel: populatedPanel,
      student,
      durationMinutes,
      message: `Interview completed for ${student?.name}. Panel ${panel.panelCode} is now AVAILABLE.`,
    };
  }
}
