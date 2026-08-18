import { InterviewSession, IInterviewSession } from '../models/InterviewSession.js';
import { EventService } from './event.service.js';
import { emitToSession, emitToAdmin } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export class SessionService {
  static async getActiveSession(): Promise<IInterviewSession> {
    let session = await InterviewSession.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 });

    if (!session) {
      // Find latest session or create a default recruitment session
      session = await InterviewSession.findOne().sort({ createdAt: -1 });

      if (!session) {
        session = await InterviewSession.create({
          sessionName: 'Club Recruitment 2026',
          description: 'Official Club Technical & Domain Recruitment Session',
          status: 'ACTIVE',
          settings: {
            allowStudentRegistration: true,
            allowReassignment: true,
            showEstimatedWait: true,
            strictPanelAvailability: true,
            defaultDurationMinutes: 15,
          },
        });

        await EventService.logEvent({
          sessionId: session._id,
          actorRole: 'SYSTEM',
          actorName: 'System Setup',
          eventType: 'SESSION_STARTED',
          entityType: 'SESSION',
          entityId: session._id,
          metadata: { sessionName: session.sessionName },
        });
      }
    }

    return session;
  }

  static async updateSession(sessionId: string, updateData: any, actor: { id?: string; name?: string; role?: any }) {
    const session = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { $set: updateData },
      { new: true }
    );

    if (!session) {
      throw new Error('Session not found');
    }

    emitToSession(session._id.toString(), SOCKET_EVENTS.SESSION_UPDATED, session);
    emitToAdmin(SOCKET_EVENTS.SESSION_UPDATED, session);

    await EventService.logEvent({
      sessionId: session._id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role || 'ADMIN',
      eventType: 'SESSION_STARTED',
      entityType: 'SESSION',
      entityId: session._id,
      metadata: updateData,
    });

    return session;
  }
}
