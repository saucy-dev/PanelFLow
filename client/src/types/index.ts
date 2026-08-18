export type UserRole = 'ADMIN' | 'PANEL' | 'STUDENT';
export type PanelStatus = 'AVAILABLE' | 'OCCUPIED' | 'PAUSED' | 'OFFLINE';
export type QueueStatus = 'WAITING' | 'ASSIGNED' | 'INTERVIEWING' | 'COMPLETED' | 'CANCELLED' | 'REMOVED';
export type AssignmentType = 'MANUAL' | 'REASSIGNED';
export type MatchLevel = 'STRONG_MATCH' | 'GOOD_MATCH' | 'NO_MATCH';

export interface IDomain {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

export interface IInterviewer {
  _id: string;
  name: string;
  email: string;
  domains: IDomain[];
  panelId?: string;
  isActive: boolean;
}

export interface IDomainPreference {
  domainId: IDomain | string;
  priority: number;
}

export interface IStudent {
  _id: string;
  registrationNumber: string;
  name: string;
  email: string;
  branch: string;
  year: number | string;
  phone?: string;
  domainPreferences: Array<{
    domainId: IDomain;
    priority: number;
  }>;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface IPanel {
  _id: string;
  panelCode: string;
  name: string;
  roomLocation?: string;
  interviewerIds: IInterviewer[];
  status: PanelStatus;
  currentCandidateId?: IStudent | null;
  currentAssignmentId?: IAssignment | string | null;
  statusUpdatedAt: string;
  createdAt: string;
}

export interface IQueueEntry {
  _id: string;
  sessionId: string;
  studentId: IStudent;
  queueNumber: number;
  joinedAt: string;
  status: QueueStatus;
  assignedPanelId?: IPanel | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  removedAt?: string | null;
  removalReason?: string;
}

export interface IAssignment {
  _id: string;
  sessionId: string;
  studentId: IStudent | string;
  panelId: IPanel | string;
  assignedBy?: { _id: string; name: string } | null;
  assignmentType: AssignmentType;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REASSIGNED';
  notes?: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMinutes?: number | null;
}

export interface ISessionSettings {
  allowStudentRegistration: boolean;
  allowReassignment: boolean;
  showEstimatedWait: boolean;
  strictPanelAvailability: boolean;
  defaultDurationMinutes: number;
}

export interface IInterviewSession {
  _id: string;
  sessionName: string;
  description?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startedAt: string;
  endedAt?: string | null;
  settings: ISessionSettings;
}

export interface IEventLog {
  _id: string;
  sessionId: string;
  actorId?: string | null;
  actorRole: 'ADMIN' | 'PANEL' | 'STUDENT' | 'SYSTEM';
  actorName?: string;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ISessionAnalytics {
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
}

export interface DomainMatchResult {
  level: MatchLevel;
  label: string;
  score: number;
  matchedPreferences: Array<{
    priority: number;
    domainId: string;
    domainName: string;
    interviewerNames: string[];
  }>;
  unmatchedPreferences: Array<{
    priority: number;
    domainId: string;
    domainName: string;
  }>;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  panelId?: string;
  studentId?: string;
}
