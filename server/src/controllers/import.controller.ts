import { Request, Response } from 'express';
import { SheetsService } from '../services/sheets.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ImportController {
  static async importCsv(req: Request, res: Response) {
    try {
      const { type, csvData, commit } = req.body;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : undefined;

      const result = await SheetsService.processCsvData(type, csvData, commit, actor);

      return ApiResponse.success(
        res,
        result,
        commit ? `Successfully imported ${result.importedCount} records` : 'Validation preview generated'
      );
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'Import processing failed', 400);
    }
  }

  static async fetchGoogleSheet(req: Request, res: Response) {
    try {
      const { sheetId, range } = req.body;
      const values = await SheetsService.fetchFromGoogleSheets(sheetId, range);
      return ApiResponse.success(res, values, 'Fetched data from Google Sheets');
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || 'Failed to fetch from Google Sheets. Ensure Google API credentials are set.',
        400
      );
    }
  }
}
