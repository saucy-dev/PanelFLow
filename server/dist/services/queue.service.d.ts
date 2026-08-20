import mongoose from 'mongoose';
import { IQueueEntry } from '../models/QueueEntry.js';
import { IStudent } from '../models/Student.js';
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
export declare class QueueService {
    /**
     * Register/Lookup Student and Join Live Waiting Queue
     */
    static joinQueue(input: JoinQueueInput, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<{
        isExisting: boolean;
        queueEntry: mongoose.Document<unknown, {}, IQueueEntry, {}, {}> & IQueueEntry & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        student: mongoose.Document<unknown, {}, IStudent, {}, {}> & IStudent & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        position: number;
        studentsAhead: number;
        message: string;
    } | {
        isExisting: boolean;
        queueEntry: (mongoose.FlattenMaps<IQueueEntry> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        student: mongoose.Document<unknown, {}, IStudent, {}, {}> & IStudent & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        position: number;
        studentsAhead: number;
        message: string;
    }>;
    /**
     * Get Live Waiting Queue for a Session
     */
    static getQueue(sessionId?: string, filterStatus?: string): Promise<(mongoose.FlattenMaps<IQueueEntry> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Get Student Queue Status by Registration Number, Email, or Queue ID
     */
    static getStudentQueueStatus(identifier: string): Promise<{
        queueEntry: mongoose.FlattenMaps<IQueueEntry> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        studentsAhead: number;
        estimatedWaitMinutes: number;
    }>;
    /**
     * Remove Student from Queue (Admin action)
     */
    static removeFromQueue(queueEntryId: string, reason?: string, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<mongoose.Document<unknown, {}, IQueueEntry, {}, {}> & IQueueEntry & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Restore Removed Student to Queue (Admin action)
     */
    static restoreToQueue(queueEntryId: string, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<mongoose.Document<unknown, {}, IQueueEntry, {}, {}> & IQueueEntry & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
