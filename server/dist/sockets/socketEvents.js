"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    // Client -> Server
    JOIN_SESSION: 'session:join',
    LEAVE_SESSION: 'session:leave',
    JOIN_PANEL: 'panel:join',
    JOIN_STUDENT: 'student:join',
    JOIN_ADMIN: 'admin:join',
    // Server -> Client
    QUEUE_UPDATED: 'queue.updated',
    QUEUE_POSITION_UPDATED: 'queue.position.updated',
    STUDENT_ASSIGNED: 'student.assigned',
    STUDENT_STATUS_UPDATED: 'student.status.updated',
    PANEL_UPDATED: 'panel.updated',
    PANEL_STATUS_UPDATED: 'panel.status.updated',
    INTERVIEW_STARTED: 'interview.started',
    INTERVIEW_COMPLETED: 'interview.completed',
    ASSIGNMENT_CREATED: 'assignment.created',
    ASSIGNMENT_UPDATED: 'assignment.updated',
    ASSIGNMENT_REASSIGNED: 'assignment.reassigned',
    SESSION_UPDATED: 'session.updated',
    EVENT_LOGGED: 'event.logged',
    NOTIFICATION_CREATED: 'notification.created',
};
//# sourceMappingURL=socketEvents.js.map