import mongoose from 'mongoose';
export declare class InterviewService {
    /**
     * Start Interview (moves status from ASSIGNED -> INTERVIEWING)
     */
    static startInterview(panelId: string, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<{
        panel: mongoose.Document<unknown, {}, import("../models/Panel.js").IPanel, {}, {}> & import("../models/Panel.js").IPanel & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        queueEntry: (mongoose.FlattenMaps<import("../models/QueueEntry.js").IQueueEntry> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    /**
     * Complete Interview (frees panel back to AVAILABLE and marks student COMPLETED)
     */
    static completeInterview(panelId: string, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<{
        panel: mongoose.Document<unknown, {}, import("../models/Panel.js").IPanel, {}, {}> & import("../models/Panel.js").IPanel & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        success?: undefined;
        student?: undefined;
        durationMinutes?: undefined;
    } | {
        success: boolean;
        panel: (mongoose.FlattenMaps<import("../models/Panel.js").IPanel> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        student: (mongoose.Document<unknown, {}, import("../models/Student.js").IStudent, {}, {}> & import("../models/Student.js").IStudent & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        durationMinutes: number;
        message: string;
    }>;
}
