import { parse } from 'csv-parse/sync';
import { google } from 'googleapis';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Student } from '../models/Student.js';
import { Domain } from '../models/Domain.js';
import { Panel } from '../models/Panel.js';
import { Interviewer } from '../models/Interviewer.js';
import { SessionService } from './session.service.js';
import { EventService } from './event.service.js';

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  preview: ImportPreviewRow[];
  committed: boolean;
  importedCount?: number;
}

export class SheetsService {
  /**
   * Parse and validate CSV data for Students, Interviewers, or Panels
   */
  static async processCsvData(
    type: 'students' | 'interviewers' | 'panels',
    csvString: string,
    commit: boolean = false,
    actor?: { id?: string; name?: string; role?: any }
  ): Promise<ImportResult> {
    const rawRecords: any[] = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const domains = await Domain.find().lean();
    const domainMapByName = new Map<string, any>();
    domains.forEach((d) => {
      domainMapByName.set(d.name.toLowerCase(), d);
      domainMapByName.set(d.slug.toLowerCase(), d);
    });

    const preview: ImportPreviewRow[] = [];
    const validDataToCommit: any[] = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const record = rawRecords[i];
      const errors: string[] = [];
      let parsedData: any = {};

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

        if (!regNo) errors.push('Missing Registration Number');
        if (!name) errors.push('Missing Name');
        if (!email) errors.push('Missing Email');

        const domainPreferences: Array<{ domainId: any; priority: number }> = [];
        const rawPrefs = [pref1, pref2, pref3].filter(Boolean);

        for (let p = 0; p < rawPrefs.length; p++) {
          const prefName = rawPrefs[p].trim().toLowerCase();
          let domainObj = domainMapByName.get(prefName);

          if (!domainObj) {
            // Auto-create domain if it doesn't exist
            if (commit) {
              const newDomain = await Domain.create({
                name: rawPrefs[p].trim(),
                slug: rawPrefs[p].trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
              });
              domainMapByName.set(newDomain.name.toLowerCase(), newDomain);
              domainMapByName.set(newDomain.slug.toLowerCase(), newDomain);
              domainObj = newDomain;
            } else {
              domainObj = { _id: new mongoose.Types.ObjectId(), name: rawPrefs[p].trim() };
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
      } else if (type === 'interviewers') {
        const name = record['Name'] || record['Interviewer'] || record['Interviewer Name'] || record['name'];
        const email = record['Email'] || record['email'];
        const panelCode = record['Panel'] || record['Panel Code'] || record['panelCode'];
        const domain1 = record['Domain 1'] || record['Domain'];
        const domain2 = record['Domain 2'];
        const domain3 = record['Domain 3'];

        if (!name) errors.push('Missing Interviewer Name');
        if (!email) errors.push('Missing Email');

        const domainIds: any[] = [];
        const rawDomains = [domain1, domain2, domain3].filter(Boolean);

        for (const dom of rawDomains) {
          const domName = dom.trim().toLowerCase();
          let domainObj = domainMapByName.get(domName);
          if (!domainObj && commit) {
            domainObj = await Domain.create({
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
      } else if (type === 'panels') {
        const panelCode = record['Panel Code'] || record['Panel'] || record['Code'] || record['panelCode'];
        const name = record['Name'] || record['Panel Name'] || record['name'];
        const roomLocation = record['Room'] || record['Location'] || record['roomLocation'] || '';

        if (!panelCode) errors.push('Missing Panel Code');
        if (!name) errors.push('Missing Panel Name');

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
      const session = await SessionService.getActiveSession();

      if (type === 'students') {
        for (const st of validDataToCommit) {
          await Student.findOneAndUpdate(
            { registrationNumber: st.registrationNumber },
            { $set: st },
            { upsert: true, new: true }
          );
          importedCount++;
        }
      } else if (type === 'panels') {
        for (const p of validDataToCommit) {
          await Panel.findOneAndUpdate(
            { panelCode: p.panelCode },
            { $set: { name: p.name, roomLocation: p.roomLocation } },
            { upsert: true, new: true }
          );
          importedCount++;
        }
      } else if (type === 'interviewers') {
        for (const it of validDataToCommit) {
          let panelId: any = null;
          if (it.panelCode) {
            let panel = await Panel.findOne({ panelCode: it.panelCode });
            if (!panel) {
              panel = await Panel.create({ panelCode: it.panelCode, name: `Panel ${it.panelCode}` });
            }
            panelId = panel._id;
          }

          const interviewer = await Interviewer.findOneAndUpdate(
            { email: it.email },
            { $set: { name: it.name, domains: it.domains, panelId } },
            { upsert: true, new: true }
          );

          if (panelId) {
            await Panel.findByIdAndUpdate(panelId, {
              $addToSet: { interviewerIds: interviewer._id },
            });
          }
          importedCount++;
        }
      }

      await EventService.logEvent({
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
  static async fetchFromGoogleSheets(sheetId: string, range: string = 'Sheet1!A1:Z100') {
    if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Google Sheets API credentials are not configured in environment variables.');
    }

    const auth = new google.auth.JWT({
      email: env.GOOGLE_CLIENT_EMAIL,
      key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    return response.data.values || [];
  }
}
