"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDomainMatch = calculateDomainMatch;
/**
 * Deterministically evaluates compatibility between a student's domain preferences
 * and the domains covered by the panel's interviewers.
 */
function calculateDomainMatch(student, panel) {
    // Collect all panel interviewer domains and the interviewers who know each domain
    const domainToInterviewersMap = new Map();
    if (panel.interviewerIds && Array.isArray(panel.interviewerIds)) {
        for (const interviewer of panel.interviewerIds) {
            if (!interviewer.domains)
                continue;
            for (const domain of interviewer.domains) {
                const id = typeof domain === 'object' && domain !== null ? domain._id?.toString() || '' : domain.toString();
                const name = typeof domain === 'object' && domain !== null ? domain.name || 'Domain' : 'Domain';
                if (!domainToInterviewersMap.has(id)) {
                    domainToInterviewersMap.set(id, { domainName: name, interviewers: [] });
                }
                domainToInterviewersMap.get(id).interviewers.push(interviewer.name);
            }
        }
    }
    const matchedPreferences = [];
    const unmatchedPreferences = [];
    // Sort student preferences by priority (1, 2, 3...)
    const sortedPrefs = [...(student.domainPreferences || [])].sort((a, b) => a.priority - b.priority);
    for (const pref of sortedPrefs) {
        const prefDomainId = typeof pref.domainId === 'object' && pref.domainId !== null
            ? pref.domainId._id?.toString() || ''
            : pref.domainId?.toString() || '';
        const prefDomainName = typeof pref.domainId === 'object' && pref.domainId !== null
            ? pref.domainId.name || `Domain ${pref.priority}`
            : `Domain ${pref.priority}`;
        const match = domainToInterviewersMap.get(prefDomainId);
        if (match) {
            matchedPreferences.push({
                priority: pref.priority,
                domainId: prefDomainId,
                domainName: match.domainName || prefDomainName,
                interviewerNames: match.interviewers,
            });
        }
        else {
            unmatchedPreferences.push({
                priority: pref.priority,
                domainId: prefDomainId,
                domainName: prefDomainName,
            });
        }
    }
    if (matchedPreferences.length === 0) {
        return {
            level: 'NO_MATCH',
            label: 'No direct preference match',
            score: 0,
            matchedPreferences: [],
            unmatchedPreferences,
        };
    }
    // Calculate score and level
    const firstMatch = matchedPreferences[0];
    let level = 'GOOD_MATCH';
    let score = 0;
    if (firstMatch.priority === 1) {
        level = 'STRONG_MATCH';
        score = 100 + (matchedPreferences.length - 1) * 20;
    }
    else if (firstMatch.priority === 2) {
        level = matchedPreferences.length > 1 ? 'STRONG_MATCH' : 'GOOD_MATCH';
        score = 60 + (matchedPreferences.length - 1) * 15;
    }
    else {
        level = 'GOOD_MATCH';
        score = 30 + (matchedPreferences.length - 1) * 10;
    }
    const primaryMatch = matchedPreferences[0];
    const interviewersStr = primaryMatch.interviewerNames.length > 0 ? ` (${primaryMatch.interviewerNames.join(', ')})` : '';
    const label = `⭐ Preference #${primaryMatch.priority}: ${primaryMatch.domainName}${interviewersStr}`;
    return {
        level,
        label,
        score,
        matchedPreferences,
        unmatchedPreferences,
    };
}
//# sourceMappingURL=domainMatcher.js.map