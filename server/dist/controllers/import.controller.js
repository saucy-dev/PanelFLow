"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const sheets_service_js_1 = require("../services/sheets.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class ImportController {
    static async importCsv(req, res) {
        try {
            const { type, csvData, commit } = req.body;
            const actor = req.user
                ? { id: req.user.userId, name: req.user.email, role: req.user.role }
                : undefined;
            const result = await sheets_service_js_1.SheetsService.processCsvData(type, csvData, commit, actor);
            return apiResponse_js_1.ApiResponse.success(res, result, commit ? `Successfully imported ${result.importedCount} records` : 'Validation preview generated');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Import processing failed', 400);
        }
    }
    static async fetchGoogleSheet(req, res) {
        try {
            const { sheetId, range } = req.body;
            const values = await sheets_service_js_1.SheetsService.fetchFromGoogleSheets(sheetId, range);
            return apiResponse_js_1.ApiResponse.success(res, values, 'Fetched data from Google Sheets');
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch from Google Sheets. Ensure Google API credentials are set.', 400);
        }
    }
}
exports.ImportController = ImportController;
//# sourceMappingURL=import.controller.js.map