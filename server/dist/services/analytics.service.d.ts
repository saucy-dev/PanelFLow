export declare class AnalyticsService {
    static getSessionAnalytics(sessionId?: string): Promise<{
        queue: {
            WAITING: number;
            ASSIGNED: number;
            INTERVIEWING: number;
            COMPLETED: number;
            CANCELLED: number;
            REMOVED: number;
            TOTAL: number;
        };
        panels: {
            AVAILABLE: number;
            OCCUPIED: number;
            PAUSED: number;
            OFFLINE: number;
            TOTAL: number;
        };
        metrics: {
            averageWaitMinutes: number;
            longestWaitMinutes: number;
            averageDurationMinutes: number;
            completedInterviews: number;
            panelUtilizationPercentage: number;
            peakQueueLength: number;
        };
    }>;
}
