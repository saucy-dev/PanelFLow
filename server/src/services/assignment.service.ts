import mongoose from 'mongoose';
import { Assignment, IAssignment } from '../models/Assignment.js';
import { Panel } from '../models/Panel.js';
import { QueueEntry } from '../models/QueueEntry.js';
import { Student } from '../models/Student.js';
import { SessionService } from './session.service.js';
import { EventService } from './event.service.js';
import { emitToSession, emitToAdmin, emitToPanel, emitToStudent } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export interface AssignInput {
  queueEntryId: string;
  panelId: string;
  notes?: string;
  actor?: { id?: string; name?: string; role?: any };
}

export interface ReassignInput {
  assignmentId?: string;
  queueEntryId?: string;
  newPanelId: string;
  notes?: string;
  actor?: { id?: string; name?: string; role?: any };
}

export class AssignmentService {
  /**
   * Assign a waiting student to an available panel with Atomic Concurrency Protection
   */
  static async assignCandidate(input: AssignInput) {
    const session = await SessionService.getActiveSession();

    // 1. Fetch and validate queue entry
    const queueEntry = await QueueEntry.findById(input.queueEntryId).populate('studentId');
    if (!queueEntry) {
      throw { statusCode: 404, message: 'Queue entry not found.' };
    }

    if (queueEntry.status !== 'WAITING') {
      throw {
        statusCode: 400,
        message: `Student is currently '${queueEntry.status}' and cannot be assigned.`,
      };
    }

    const student = queueEntry.studentId as any;

    // 2. Atomic check and lock on Panel
    // Prevents two admins from assigning different students to the same panel simultaneously
    const lockedPanel = await Panel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(input.panelId),
        status: 'AVAILABLE',
      },
      {
        status: 'OCCUPIED',
        currentCandidateId: student._id,
        statusUpdatedAt: new Date(),
      },
      { new: true }
    ).populate({
      path: 'interviewerIds',
      populate: { path: 'domains' },
    });

    if (!lockedPanel) {
      const panelExists = await Panel.findById(input.panelId);
      const panelName = panelExists ? panelExists.panelCode : 'Selected panel';
      throw {
        statusCode: 409,
        message: `Panel ${panelName} is no longer available. Another coordinator may have just assigned a candidate. The dashboard has been updated.`,
      };
    }

    // 3. Create Assignment record
    const assignment = await Assignment.create({
      sessionId: session._id,
      studentId: student._id,
      panelId: lockedPanel._id,
      assignedBy: input.actor?.id ? new mongoose.Types.ObjectId(input.actor.id) : null,
      assignmentType: 'MANUAL',
      status: 'ACTIVE',
      notes: input.notes || '',
    });

    // 4. Update Panel with assignment ID
    lockedPanel.currentAssignmentId = assignment._id;
    await lockedPanel.save();

    // 5. Update Queue Entry and Student
    queueEntry.status = 'ASSIGNED';
    queueEntry.assignedPanelId = lockedPanel._id;
    queueEntry.assignedAt = new Date();
    await queueEntry.save();

    await Student.findByIdAndUpdate(student._id, { status: 'ASSIGNED' });

    // 6. Fetch fully populated models for broadcasting
    const populatedQueueEntry = await QueueEntry.findById(queueEntry._id)
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

    const populatedPanel = await Panel.findById(lockedPanel._id)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .populate({
        path: 'currentCandidateId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .populate('currentAssignmentId')
      .lean();

    // 7. Log audit event
    await EventService.logEvent({
      sessionId: session._id,
      actorId: input.actor?.id,
      actorName: input.actor?.name,
      actorRole: input.actor?.role || 'ADMIN',
      eventType: 'STUDENT_ASSIGNED',
      entityType: 'ASSIGNMENT',
      entityId: assignment._id,
      metadata: {
        queueNumber: queueEntry.queueNumber,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
        panelCode: lockedPanel.panelCode,
      },
    });

    // 8. Real-time broadcast
    emitToSession(session._id.toString(), SOCKET_EVENTS.STUDENT_ASSIGNED, {
      queueEntry: populatedQueueEntry,
      panel: populatedPanel,
      assignment,
    });
    emitToAdmin(SOCKET_EVENTS.STUDENT_ASSIGNED, {
      queueEntry: populatedQueueEntry,
      panel: populatedPanel,
      assignment,
    });
    emitToPanel(lockedPanel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToStudent(student._id.toString(), SOCKET_EVENTS.STUDENT_ASSIGNED, {
      queueEntry: populatedQueueEntry,
      panel: populatedPanel,
      assignment,
    });

    return {
      assignment,
      queueEntry: populatedQueueEntry,
      panel: populatedPanel,
    };
  }

  /**
   * Reassign a candidate to another panel with Atomic Locking & Release
   */
  static async reassignCandidate(input: ReassignInput) {
    const session = await SessionService.getActiveSession();

    let currentAssignment: any = null;
    let queueEntry: any = null;

    if (input.assignmentId) {
      currentAssignment = await Assignment.findById(input.assignmentId);
    }

    if (!currentAssignment && input.queueEntryId) {
      queueEntry = await QueueEntry.findById(input.queueEntryId);
      if (queueEntry) {
        currentAssignment = await Assignment.findOne({
          studentId: queueEntry.studentId,
          status: 'ACTIVE',
        });
      }
    }

    if (!currentAssignment) {
      throw { statusCode: 404, message: 'Active assignment not found for reassignment.' };
    }

    if (!queueEntry) {
      queueEntry = await QueueEntry.findOne({
        sessionId: session._id,
        studentId: currentAssignment.studentId,
      });
    }

    const previousPanelId = currentAssignment.panelId;
    const newPanelId = new mongoose.Types.ObjectId(input.newPanelId);

    if (previousPanelId.toString() === newPanelId.toString()) {
      throw { statusCode: 400, message: 'Candidate is already assigned to this panel.' };
    }

    // 1. Lock the NEW panel atomically
    const newPanel = await Panel.findOneAndUpdate(
      {
        _id: newPanelId,
        status: 'AVAILABLE',
      },
      {
        status: 'OCCUPIED',
        currentCandidateId: currentAssignment.studentId,
        statusUpdatedAt: new Date(),
      },
      { new: true }
    );

    if (!newPanel) {
      const panelExists = await Panel.findById(newPanelId);
      const panelName = panelExists ? panelExists.panelCode : 'Target panel';
      throw {
        statusCode: 409,
        message: `Target Panel ${panelName} is no longer available. Please select another available panel.`,
      };
    }

    // 2. Free the OLD panel atomically
    const oldPanel = await Panel.findByIdAndUpdate(
      previousPanelId,
      {
        status: 'AVAILABLE',
        currentCandidateId: null,
        currentAssignmentId: null,
        statusUpdatedAt: new Date(),
      },
      { new: true }
    );

    // 3. Mark old assignment as REASSIGNED
    currentAssignment.status = 'REASSIGNED';
    await currentAssignment.save();

    // 4. Create NEW assignment record
    const newAssignment = await Assignment.create({
      sessionId: session._id,
      studentId: currentAssignment.studentId,
      panelId: newPanel._id,
      previousPanelId: previousPanelId,
      assignedBy: input.actor?.id ? new mongoose.Types.ObjectId(input.actor.id) : null,
      assignmentType: 'REASSIGNED',
      status: 'ACTIVE',
      notes: input.notes || '',
    });

    newPanel.currentAssignmentId = newAssignment._id;
    await newPanel.save();

    // 5. Update Queue Entry
    if (queueEntry) {
      queueEntry.assignedPanelId = newPanel._id;
      queueEntry.assignedAt = new Date();
      await queueEntry.save();
    }

    const student = await Student.findById(currentAssignment.studentId);

    // 6. Log audit event
    await EventService.logEvent({
      sessionId: session._id,
      actorId: input.actor?.id,
      actorName: input.actor?.name,
      actorRole: input.actor?.role || 'ADMIN',
      eventType: 'STUDENT_REASSIGNED',
      entityType: 'ASSIGNMENT',
      entityId: newAssignment._id,
      metadata: {
        studentName: student?.name,
        fromPanel: oldPanel?.panelCode,
        toPanel: newPanel.panelCode,
      },
    });

    // 7. Fetch populated representations
    const populatedNewPanel = await Panel.findById(newPanel._id)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .populate({
        path: 'currentCandidateId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .populate('currentAssignmentId')
      .lean();

    const populatedOldPanel = await Panel.findById(previousPanelId)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .lean();

    const populatedQueueEntry = queueEntry
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

    // 8. Broadcast updates
    emitToSession(session._id.toString(), SOCKET_EVENTS.ASSIGNMENT_REASSIGNED, {
      newPanel: populatedNewPanel,
      oldPanel: populatedOldPanel,
      queueEntry: populatedQueueEntry,
      assignment: newAssignment,
    });
    emitToAdmin(SOCKET_EVENTS.ASSIGNMENT_REASSIGNED, {
      newPanel: populatedNewPanel,
      oldPanel: populatedOldPanel,
      queueEntry: populatedQueueEntry,
      assignment: newAssignment,
    });
    emitToPanel(newPanel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedNewPanel);
    emitToPanel(previousPanelId.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedOldPanel);
    if (student) {
      emitToStudent(student._id.toString(), SOCKET_EVENTS.STUDENT_ASSIGNED, {
        panel: populatedNewPanel,
        queueEntry: populatedQueueEntry,
      });
    }

    return {
      assignment: newAssignment,
      newPanel: populatedNewPanel,
      oldPanel: populatedOldPanel,
      queueEntry: populatedQueueEntry,
    };
  }

  /**
   * Cancel an assignment and return candidate to queue
   */
  static async cancelAssignment(assignmentId: string, reason?: string, returnToQueue: boolean = true, actor?: any) {
    const session = await SessionService.getActiveSession();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw { statusCode: 404, message: 'Assignment not found.' };
    }

    assignment.status = 'CANCELLED';
    assignment.cancelledAt = new Date();
    await assignment.save();

    // Free panel
    const panel = await Panel.findByIdAndUpdate(
      assignment.panelId,
      {
        status: 'AVAILABLE',
        currentCandidateId: null,
        currentAssignmentId: null,
        statusUpdatedAt: new Date(),
      },
      { new: true }
    ).populate({
      path: 'interviewerIds',
      populate: { path: 'domains' },
    });

    // Update queue entry
    const queueEntry = await QueueEntry.findOne({
      sessionId: session._id,
      studentId: assignment.studentId,
    });

    if (queueEntry) {
      queueEntry.status = returnToQueue ? 'WAITING' : 'CANCELLED';
      queueEntry.assignedPanelId = null;
      await queueEntry.save();
    }

    await Student.findByIdAndUpdate(assignment.studentId, {
      status: returnToQueue ? 'IN_QUEUE' : 'CANCELLED',
    });

    await EventService.logEvent({
      sessionId: session._id,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'ADMIN',
      eventType: 'ASSIGNMENT_CANCELLED',
      entityType: 'ASSIGNMENT',
      entityId: assignment._id,
      metadata: { reason, returnToQueue },
    });

    emitToSession(session._id.toString(), SOCKET_EVENTS.QUEUE_UPDATED, { action: 'CANCELLED' });
    emitToAdmin(SOCKET_EVENTS.QUEUE_UPDATED, { action: 'CANCELLED' });
    if (panel) {
      emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, panel);
    }
    emitToStudent(assignment.studentId.toString(), SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
      status: returnToQueue ? 'WAITING' : 'CANCELLED',
    });

    return { success: true, message: 'Assignment cancelled.' };
  }
}
