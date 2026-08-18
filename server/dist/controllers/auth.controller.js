"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = require("../models/User.js");
const Panel_js_1 = require("../models/Panel.js");
const jwt_js_1 = require("../utils/jwt.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;
        const user = await User_js_1.User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user || !user.passwordHash) {
            return apiResponse_js_1.ApiResponse.error(res, 'Invalid email or password', 401);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return apiResponse_js_1.ApiResponse.error(res, 'Invalid email or password', 401);
        }
        const token = (0, jwt_js_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            panelId: user.panelId?.toString(),
            studentId: user.studentId?.toString(),
        });
        (0, jwt_js_1.setAuthCookie)(res, token);
        return apiResponse_js_1.ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                panelId: user.panelId,
                studentId: user.studentId,
            },
            token,
        }, 'Logged in successfully');
    }
    static async panelLogin(req, res) {
        const { panelCode } = req.body;
        const panel = await Panel_js_1.Panel.findOne({ panelCode: panelCode.toUpperCase() }).populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        });
        if (!panel) {
            return apiResponse_js_1.ApiResponse.error(res, `Panel ${panelCode.toUpperCase()} not found`, 404);
        }
        let user = await User_js_1.User.findOne({ email: `panel-${panel.panelCode.toLowerCase()}@panelflow.local` });
        if (!user) {
            user = await User_js_1.User.create({
                name: `Panel ${panel.panelCode}`,
                email: `panel-${panel.panelCode.toLowerCase()}@panelflow.local`,
                role: 'PANEL',
                panelId: panel._id,
            });
        }
        else if (!user.panelId) {
            user.panelId = panel._id;
            await user.save();
        }
        const token = (0, jwt_js_1.signToken)({
            userId: user._id.toString(),
            role: 'PANEL',
            email: user.email,
            panelId: panel._id.toString(),
        });
        (0, jwt_js_1.setAuthCookie)(res, token);
        return apiResponse_js_1.ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'PANEL',
                panelId: panel._id,
            },
            panel,
            token,
        }, `Logged in as Panel ${panel.panelCode}`);
    }
    static async me(req, res) {
        if (!req.user) {
            return apiResponse_js_1.ApiResponse.error(res, 'Not authenticated', 401);
        }
        const user = await User_js_1.User.findById(req.user.userId);
        if (!user) {
            return apiResponse_js_1.ApiResponse.error(res, 'User not found', 404);
        }
        let panelData = null;
        if (user.panelId) {
            panelData = await Panel_js_1.Panel.findById(user.panelId).populate({
                path: 'interviewerIds',
                populate: { path: 'domains' },
            });
        }
        return apiResponse_js_1.ApiResponse.success(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                panelId: user.panelId,
                studentId: user.studentId,
            },
            panel: panelData,
        });
    }
    static async logout(req, res) {
        (0, jwt_js_1.clearAuthCookie)(res);
        return apiResponse_js_1.ApiResponse.success(res, null, 'Logged out successfully');
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map