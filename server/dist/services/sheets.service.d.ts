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
export declare class SheetsService {
    /**
     * Parse and validate CSV data for Students, Interviewers, or Panels
     */
    static processCsvData(type: 'students' | 'interviewers' | 'panels', csvString: string, commit?: boolean, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<ImportResult>;
    /**
     * Fetch from Google Sheets API v4 using Service Account or public sheet ID
     */
    static fetchFromGoogleSheets(sheetId: string, range?: string): Promise<any[][]>;
}
