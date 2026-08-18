"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetsService = void 0;
const sync_1 = require("csv-parse/sync");
const googleapis_1 = require("googleapis");
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const Student_js_1 = require("../models/Student.js");
const Domain_js_1 = require("../models/Domain.js");
const Panel_js_1 = require("../models/Panel.js");
const Interviewer_js_1 = require("../models/Interviewer.js");
const session_service_js_1 = require("./session.service.js");
const event_service_js_1 = require("./event.service.js");
class SheetsService {
    /**
     * Parse and validate CSV data for Students, Interviewers, or Panels
     */
    static async processCsvData(type, csvString, commit = false, actor) {
        const rawRecords = (0, sync_1.parse)(csvString, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        const domains = await Domain_js_1.Domain.find().lean();
        const domainMapByName = new Map();
        domains.forEach((d) => {
            domainMapByName.set(d.name.toLowerCase(), d);
            domainMapByName.set(d.slug.toLowerCase(), d);
        });
        const preview = [];
        const validDataToCommit = [];
        for (let i = 0; i < rawRecords.length; i++) {
            const record = rawRecords[i];
            const errors = [];
            let parsedData = {};
            if (type === 'students') {
                const regNo = record['Registration Number'] || record['RegNo'] || record['Reg No'] || record['registrationNumber'] || record['Registration'];
                const name = record['Name'] || record['Student Name'] || record['name'];
                const email = record['Email'] || record['email'];
                const branch = record['Branch'] || record['branch'] || 'CSE';
                const year = record['Year'] || record['year'] || 1;
                const phone = record['Phone'] || record['Contact'] || '';
                const pref1 = record['Preference 1'] || record['Pref 1'] || record['Domain 1'] || record['preference1'];
                const pref2 = record['Preference 2'] || record['Pref 2'] || record['Domain 2'] || record['preference2'];
                const pref3 = record['Preference 3'] || record['Pref 3'] || record['Domain 3'] || record['preference3'];
                if (!regNo)
                    errors.push('Missing Registration Number');
                if (!name)
                    errors.push('Missing Name');
                if (!email)
                    errors.push('Missing Email');
                const domainPreferences = [];
                const rawPrefs = [pref1, pref2, pref3].filter(Boolean);
                for (let p = 0; p < rawPrefs.length; p++) {
                    const prefName = rawPrefs[p].trim().toLowerCase();
                    let domainObj = domainMapByName.get(prefName);
                    if (!domainObj) {
                        // Auto-create domain if it doesn't exist
                        if (commit) {
                            const newDomain = await Domain_js_1.Domain.create({
                                name: rawPrefs[p].trim(),
                                slug: rawPrefs[p].trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
                            });
                            domainMapByName.set(newDomain.name.toLowerCase(), newDomain);
                            domainMapByName.set(newDomain.slug.toLowerCase(), newDomain);
                            domainObj = newDomain;
                        }
                        else {
                            domainObj = { _id: new mongoose_1.default.Types.ObjectId(), name: rawPrefs[p].trim() };
                        }
                    }
                    if (domainObj) {
                        domainPreferences.push({
                            domainId: domainObj._id,
                            priority: p + 1,
                        });
                    }
                }
                parsedData = {
                    registrationNumber: regNo ? regNo.toString().trim().toUpperCase() : '',
                    name: name ? name.toString().trim() : '',
                    email: email ? email.toString().trim().toLowerCase() : '',
                    branch: branch ? branch.toString().trim() : 'CSE',
                    year: year ? year.toString().trim() : '1',
                    phone: phone ? phone.toString().trim() : '',
                    domainPreferences,
                };
            }
            else if (type === 'interviewers') {
                const name = record['Name'] || record['Interviewer'] || record['Interviewer Name'] || record['name'];
                const email = record['Email'] || record['email'];
                const panelCode = record['Panel'] || record['Panel Code'] || record['panelCode'];
                const domain1 = record['Domain 1'] || record['Domain'];
                const domain2 = record['Domain 2'];
                const domain3 = record['Domain 3'];
                if (!name)
                    errors.push('Missing Interviewer Name');
                if (!email)
                    errors.push('Missing Email');
                const domainIds = [];
                const rawDomains = [domain1, domain2, domain3].filter(Boolean);
                for (const dom of rawDomains) {
                    const domName = dom.trim().toLowerCase();
                    let domainObj = domainMapByName.get(domName);
                    if (!domainObj && commit) {
                        domainObj = await Domain_js_1.Domain.create({
                            name: dom.trim(),
                            slug: dom.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        });
                        domainMapByName.set(domainObj.name.toLowerCase(), domainObj);
                    }
                    if (domainObj) {
                        domainIds.push(domainObj._id);
                    }
                }
                parsedData = {
                    name: name ? name.toString().trim() : '',
                    email: email ? email.toString().trim().toLowerCase() : '',
                    panelCode: panelCode ? panelCode.toString().trim().toUpperCase() : null,
                    domains: domainIds,
                };
            }
            else if (type === 'panels') {
                const panelCode = record['Panel Code'] || record['Panel'] || record['Code'] || record['panelCode'];
                const name = record['Name'] || record['Panel Name'] || record['name'];
                const roomLocation = record['Room'] || record['Location'] || record['roomLocation'] || '';
                if (!panelCode)
                    errors.push('Missing Panel Code');
                if (!name)
                    errors.push('Missing Panel Name');
                parsedData = {
                    panelCode: panelCode ? panelCode.toString().trim().toUpperCase() : '',
                    name: name ? name.toString().trim() : `Panel ${panelCode}`,
                    roomLocation: roomLocation ? roomLocation.toString().trim() : '',
                };
            }
            const isValid = errors.length === 0;
            preview.push({
                rowNumber: i + 1,
                data: parsedData,
                isValid,
                errors,
            });
            if (isValid) {
                validDataToCommit.push(parsedData);
            }
        }
        let importedCount = 0;
        if (commit && validDataToCommit.length > 0) {
            const session = await session_service_js_1.SessionService.getActiveSession();
            if (type === 'students') {
                for (const st of validDataToCommit) {
                    await Student_js_1.Student.findOneAndUpdate({ registrationNumber: st.registrationNumber }, { $set: st }, { upsert: true, new: true });
                    importedCount++;
                }
            }
            else if (type === 'panels') {
                for (const p of validDataToCommit) {
                    await Panel_js_1.Panel.findOneAndUpdate({ panelCode: p.panelCode }, { $set: { name: p.name, roomLocation: p.roomLocation } }, { upsert: true, new: true });
                    importedCount++;
                }
            }
            else if (type === 'interviewers') {
                for (const it of validDataToCommit) {
                    let panelId = null;
                    if (it.panelCode) {
                        let panel = await Panel_js_1.Panel.findOne({ panelCode: it.panelCode });
                        if (!panel) {
                            panel = await Panel_js_1.Panel.create({ panelCode: it.panelCode, name: `Panel ${it.panelCode}` });
                        }
                        panelId = panel._id;
                    }
                    const interviewer = await Interviewer_js_1.Interviewer.findOneAndUpdate({ email: it.email }, { $set: { name: it.name, domains: it.domains, panelId } }, { upsert: true, new: true });
                    if (panelId) {
                        await Panel_js_1.Panel.findByIdAndUpdate(panelId, {
                            $addToSet: { interviewerIds: interviewer._id },
                        });
                    }
                    importedCount++;
                }
            }
            await event_service_js_1.EventService.logEvent({
                sessionId: session._id,
                actorId: actor?.id,
                actorName: actor?.name,
                actorRole: actor?.role || 'ADMIN',
                eventType: 'DATA_IMPORTED',
                entityType: 'SESSION',
                entityId: session._id,
                metadata: { type, count: importedCount },
            });
        }
        return {
            totalRows: preview.length,
            validRows: preview.filter((p) => p.isValid).length,
            invalidRows: preview.filter((p) => !p.isValid).length,
            preview,
            committed: commit,
            importedCount,
        };
    }
    /**
     * Fetch from Google Sheets API v4 using Service Account or public sheet ID
     */
    static async fetchFromGoogleSheets(sheetId, range = 'Sheet1!A1:Z100') {
        if (!env_js_1.env.GOOGLE_CLIENT_EMAIL || !env_js_1.env.GOOGLE_PRIVATE_KEY) {
            throw new Error('Google Sheets API credentials are not configured in environment variables.');
        }
        const auth = new googleapis_1.google.auth.JWT({
            email: env_js_1.env.GOOGLE_CLIENT_EMAIL,
            key: env_js_1.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range,
        });
        return response.data.values || [];
    }
}
exports.SheetsService = SheetsService;
//# sourceMappingURL=sheets.service.js.map