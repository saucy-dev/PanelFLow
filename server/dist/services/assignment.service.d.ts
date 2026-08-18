import mongoose from 'mongoose';
import { IAssignment } from '../models/Assignment.js';
export interface AssignInput {
    queueEntryId: string;
    panelId: string;
    notes?: string;
    actor?: {
        id?: string;
        name?: string;
        role?: any;
    };
}
export interface ReassignInput {
    assignmentId?: string;
    queueEntryId?: string;
    newPanelId: string;
    notes?: string;
    actor?: {
        id?: string;
        name?: string;
        role?: any;
    };
}
export declare class AssignmentService {
    /**
     * Assign a waiting student to an available panel with Atomic Concurrency Protection
     */
    static assignCandidate(input: AssignInput): Promise<{
        assignment: mongoose.Document<unknown, {}, IAssignment, {}, {}> & IAssignment & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        queueEntry: (mongoose.FlattenMaps<import("../models/QueueEntry.js").IQueueEntry> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        panel: (mongoose.FlattenMaps<import("../models/Panel.js").IPanel> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    /**
     * Reassign a candidate to another panel with Atomic Locking & Release
     */
    static reassignCandidate(input: ReassignInput): Promise<{
        assignment: mongoose.Document<unknown, {}, IAssignment, {}, {}> & IAssignment & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        newPanel: (mongoose.FlattenMaps<import("../models/Panel.js").IPanel> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        oldPanel: (mongoose.FlattenMaps<import("../models/Panel.js").IPanel> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        queueEntry: (mongoose.FlattenMaps<import("../models/QueueEntry.js").IQueueEntry> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    /**
     * Cancel an assignment and return candidate to queue
     */
    static cancelAssignment(assignmentId: string, reason?: string, returnToQueue?: boolean, actor?: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
