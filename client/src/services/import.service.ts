import { api } from './api.js';

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

export const importService = {
  processCsv: (type: 'students' | 'interviewers' | 'panels', csvData: string, commit: boolean = false) =>
    api.post<ImportResult>('/import/csv', { type, csvData, commit }),

  fetchGoogleSheet: (sheetId: string, range?: string) =>
    api.post<any[][]>('/import/google-sheets', { sheetId, range }),
};
