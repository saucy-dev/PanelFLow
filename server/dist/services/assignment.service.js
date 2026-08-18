"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Assignment_js_1 = require("../models/Assignment.js");
const Panel_js_1 = require("../models/Panel.js");
const QueueEntry_js_1 = require("../models/QueueEntry.js");
const Student_js_1 = require("../models/Student.js");
const session_service_js_1 = require("./session.service.js");
const event_service_js_1 = require("./event.service.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class AssignmentService {
    /**
     * Assign a waiting student to an available panel with Atomic Concurrency Protection
     */
    static async assignCandidate(input) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        // 1. Fetch and validate queue entry
        const queueEntry = await QueueEntry_js_1.QueueEntry.findById(input.queueEntryId).populate('studentId');
        if (!queueEntry) {
            throw { statusCode: 404, message: 'Queue entry not found.' };
        }
        if (queueEntry.status !== 'WAITING') {
            throw {
                statusCode: 400,
                message: `Student is currently '${queueEntry.status}' and cannot be assigned.`,
            };
        }
        const student = queueEntry.studentId;
        // 2. Atomic check and lock on Panel
        // Prevents two admins from assigning different students to the same panel simultaneously
        const lockedPanel = await Panel_js_1.Panel.findOneAndUpdate({
            _id: new mongoose_1.default.Types.ObjectId(input.panelId),
            status: 'AVAILABLE',
        }, {
            status: 'OCCUPIED',
            currentCandidateId: student._id,
            statusUpdatedAt: new Date(),
        }, { new: true }).populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        });
        if (!lockedPanel) {
            const panelExists = await Panel_js_1.Panel.findById(input.panelId);
            const panelName = panelExists ? panelExists.panelCode : 'Selected panel';
            throw {
                statusCode: 409,
                message: `Panel ${panelName} is no longer available. Another coordinator may have just assigned a candidate. The dashboard has been updated.`,
            };
        }
        // 3. Create Assignment record
        const assignment = await Assignment_js_1.Assignment.create({
            sessionId: session._id,
            studentId: student._id,
            panelId: lockedPanel._id,
            assignedBy: input.actor?.id ? new mongoose_1.default.Types.ObjectId(input.actor.id) : null,
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
        await Student_js_1.Student.findByIdAndUpdate(student._id, { status: 'ASSIGNED' });
        // 6. Fetch fully populated models for broadcasting
        const populatedQueueEntry = await QueueEntry_js_1.QueueEntry.findById(queueEntry._id)
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
        const populatedPanel = await Panel_js_1.Panel.findById(lockedPanel._id)
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
        await event_service_js_1.EventService.logEvent({
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
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_ASSIGNED, {
            queueEntry: populatedQueueEntry,
            panel: populatedPanel,
            assignment,
        });
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.STUDENT_ASSIGNED, {
            queueEntry: populatedQueueEntry,
            panel: populatedPanel,
            assignment,
        });
        (0, socketHandler_js_1.emitToPanel)(lockedPanel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToStudent)(student._id.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_ASSIGNED, {
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
    static async reassignCandidate(input) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        let currentAssignment = null;
        let queueEntry = null;
        if (input.assignmentId) {
            currentAssignment = await Assignment_js_1.Assignment.findById(input.assignmentId);
        }
        if (!currentAssignment && input.queueEntryId) {
            queueEntry = await QueueEntry_js_1.QueueEntry.findById(input.queueEntryId);
            if (queueEntry) {
                currentAssignment = await Assignment_js_1.Assignment.findOne({
                    studentId: queueEntry.studentId,
                    status: 'ACTIVE',
                });
            }
        }
        if (!currentAssignment) {
            throw { statusCode: 404, message: 'Active assignment not found for reassignment.' };
        }
        if (!queueEntry) {
            queueEntry = await QueueEntry_js_1.QueueEntry.findOne({
                sessionId: session._id,
                studentId: currentAssignment.studentId,
            });
        }
        const previousPanelId = currentAssignment.panelId;
        const newPanelId = new mongoose_1.default.Types.ObjectId(input.newPanelId);
        if (previousPanelId.toString() === newPanelId.toString()) {
            throw { statusCode: 400, message: 'Candidate is already assigned to this panel.' };
        }
        // 1. Lock the NEW panel atomically
        const newPanel = await Panel_js_1.Panel.findOneAndUpdate({
            _id: newPanelId,
            status: 'AVAILABLE',
        }, {
            status: 'OCCUPIED',
            currentCandidateId: currentAssignment.studentId,
            statusUpdatedAt: new Date(),
        }, { new: true });
        if (!newPanel) {
            const panelExists = await Panel_js_1.Panel.findById(newPanelId);
            const panelName = panelExists ? panelExists.panelCode : 'Target panel';
            throw {
                statusCode: 409,
                message: `Target Panel ${panelName} is no longer available. Please select another available panel.`,
            };
        }
        // 2. Free the OLD panel atomically
        const oldPanel = await Panel_js_1.Panel.findByIdAndUpdate(previousPanelId, {
            status: 'AVAILABLE',
            currentCandidateId: null,
            currentAssignmentId: null,
            statusUpdatedAt: new Date(),
        }, { new: true });
        // 3. Mark old assignment as REASSIGNED
        currentAssignment.status = 'REASSIGNED';
        await currentAssignment.save();
        // 4. Create NEW assignment record
        const newAssignment = await Assignment_js_1.Assignment.create({
            sessionId: session._id,
            studentId: currentAssignment.studentId,
            panelId: newPanel._id,
            previousPanelId: previousPanelId,
            assignedBy: input.actor?.id ? new mongoose_1.default.Types.ObjectId(input.actor.id) : null,
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
        const student = await Student_js_1.Student.findById(currentAssignment.studentId);
        // 6. Log audit event
        await event_service_js_1.EventService.logEvent({
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
        const populatedNewPanel = await Panel_js_1.Panel.findById(newPanel._id)
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
        const populatedOldPanel = await Panel_js_1.Panel.findById(previousPanelId)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .lean();
        const populatedQueueEntry = queueEntry
            ? await QueueEntry_js_1.QueueEntry.findById(queueEntry._id)
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
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.ASSIGNMENT_REASSIGNED, {
            newPanel: populatedNewPanel,
            oldPanel: populatedOldPanel,
            queueEntry: populatedQueueEntry,
            assignment: newAssignment,
        });
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.ASSIGNMENT_REASSIGNED, {
            newPanel: populatedNewPanel,
            oldPanel: populatedOldPanel,
            queueEntry: populatedQueueEntry,
            assignment: newAssignment,
        });
        (0, socketHandler_js_1.emitToPanel)(newPanel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedNewPanel);
        (0, socketHandler_js_1.emitToPanel)(previousPanelId.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedOldPanel);
        if (student) {
            (0, socketHandler_js_1.emitToStudent)(student._id.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_ASSIGNED, {
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
    static async cancelAssignment(assignmentId, reason, returnToQueue = true, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const assignment = await Assignment_js_1.Assignment.findById(assignmentId);
        if (!assignment) {
            throw { statusCode: 404, message: 'Assignment not found.' };
        }
        assignment.status = 'CANCELLED';
        assignment.cancelledAt = new Date();
        await assignment.save();
        // Free panel
        const panel = await Panel_js_1.Panel.findByIdAndUpdate(assignment.panelId, {
            status: 'AVAILABLE',
            currentCandidateId: null,
            currentAssignmentId: null,
            statusUpdatedAt: new Date(),
        }, { new: true }).populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        });
        // Update queue entry
        const queueEntry = await QueueEntry_js_1.QueueEntry.findOne({
            sessionId: session._id,
            studentId: assignment.studentId,
        });
        if (queueEntry) {
            queueEntry.status = returnToQueue ? 'WAITING' : 'CANCELLED';
            queueEntry.assignedPanelId = null;
            await queueEntry.save();
        }
        await Student_js_1.Student.findByIdAndUpdate(assignment.studentId, {
            status: returnToQueue ? 'IN_QUEUE' : 'CANCELLED',
        });
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'ADMIN',
            eventType: 'ASSIGNMENT_CANCELLED',
            entityType: 'ASSIGNMENT',
            entityId: assignment._id,
            metadata: { reason, returnToQueue },
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, { action: 'CANCELLED' });
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, { action: 'CANCELLED' });
        if (panel) {
            (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, panel);
        }
        (0, socketHandler_js_1.emitToStudent)(assignment.studentId.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
            status: returnToQueue ? 'WAITING' : 'CANCELLED',
        });
        return { success: true, message: 'Assignment cancelled.' };
    }
}
exports.AssignmentService = AssignmentService;
//# sourceMappingURL=assignment.service.js.map