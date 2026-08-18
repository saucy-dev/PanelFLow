"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainController = void 0;
const Domain_js_1 = require("../models/Domain.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class DomainController {
    static async getAllDomains(req, res) {
        try {
            const domains = await Domain_js_1.Domain.find({ isActive: true }).sort({ name: 1 }).lean();
            return apiResponse_js_1.ApiResponse.success(res, domains);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to fetch domains', 500);
        }
    }
    static async createDomain(req, res) {
        try {
            const { name, description, color } = req.body;
            const domain = await Domain_js_1.Domain.create({ name, description, color });
            return apiResponse_js_1.ApiResponse.success(res, domain, 'Domain created successfully', 201);
        }
        catch (error) {
            return apiResponse_js_1.ApiResponse.error(res, error.message || 'Failed to create domain', 400);
        }
    }
}
exports.DomainController = DomainController;
//# sourceMappingURL=domain.controller.js.map