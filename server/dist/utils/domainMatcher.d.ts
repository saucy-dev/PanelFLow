export type MatchLevel = 'STRONG_MATCH' | 'GOOD_MATCH' | 'NO_MATCH';
export interface MatchedPreferenceDetail {
    priority: number;
    domainId: string;
    domainName: string;
    interviewerNames: string[];
}
export interface DomainMatchResult {
    level: MatchLevel;
    label: string;
    score: number;
    matchedPreferences: MatchedPreferenceDetail[];
    unmatchedPreferences: {
        priority: number;
        domainId: string;
        domainName: string;
    }[];
}
export interface MatcherStudentInput {
    domainPreferences: Array<{
        domainId: string | {
            _id: string;
            name: string;
        };
        priority: number;
    }>;
}
export interface MatcherPanelInput {
    interviewerIds?: Array<{
        _id?: string;
        name: string;
        domains: Array<string | {
            _id: string;
            name: string;
            slug?: string;
        }>;
    }>;
}
/**
 * Deterministically evaluates compatibility between a student's domain preferences
 * and the domains covered by the panel's interviewers.
 */
export declare function calculateDomainMatch(student: MatcherStudentInput, panel: MatcherPanelInput): DomainMatchResult;
