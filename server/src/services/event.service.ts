import mongoose from 'mongoose';
import { EventLog, EventType, EntityType, IEventLog } from '../models/EventLog.js';
import { emitToSession, emitToAdmin } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export interface CreateEventParams {
  sessionId: mongoose.Types.ObjectId | string;
  actorId?: mongoose.Types.ObjectId | string | null;
  actorRole?: 'ADMIN' | 'PANEL' | 'STUDENT' | 'SYSTEM';
  actorName?: string;
  eventType: EventType;
  entityType: EntityType;
  entityId?: mongoose.Types.ObjectId | string | null;
  metadata?: Record<string, any>;
}

export class EventService {
  static async logEvent(params: CreateEventParams): Promise<IEventLog> {
    const event = await EventLog.create({
      sessionId: new mongoose.Types.ObjectId(params.sessionId.toString()),
      actorId: params.actorId ? new mongoose.Types.ObjectId(params.actorId.toString()) : null,
      actorRole: params.actorRole || 'SYSTEM',
      actorName: params.actorName || (params.actorRole ? params.actorRole : 'System'),
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId ? params.entityId.toString() : null,
      metadata: params.metadata || {},
    });

    // Broadcast live event log
    emitToSession(params.sessionId.toString(), SOCKET_EVENTS.EVENT_LOGGED, event);
    emitToAdmin(SOCKET_EVENTS.EVENT_LOGGED, event);

    return event;
  }

  static async getSessionEvents(sessionId: string, limit = 100) {
    return EventLog.find({ sessionId: new mongoose.Types.ObjectId(sessionId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
