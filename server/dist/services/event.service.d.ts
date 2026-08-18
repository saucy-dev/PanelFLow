import mongoose from 'mongoose';
import { EventType, EntityType, IEventLog } from '../models/EventLog.js';
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
export declare class EventService {
    static logEvent(params: CreateEventParams): Promise<IEventLog>;
    static getSessionEvents(sessionId: string, limit?: number): Promise<(mongoose.FlattenMaps<IEventLog> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
