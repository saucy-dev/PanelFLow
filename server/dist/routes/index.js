"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const student_routes_js_1 = __importDefault(require("./student.routes.js"));
const queue_routes_js_1 = __importDefault(require("./queue.routes.js"));
const panel_routes_js_1 = __importDefault(require("./panel.routes.js"));
const assignment_routes_js_1 = __importDefault(require("./assignment.routes.js"));
const interview_routes_js_1 = __importDefault(require("./interview.routes.js"));
const admin_routes_js_1 = __importDefault(require("./admin.routes.js"));
const session_routes_js_1 = __importDefault(require("./session.routes.js"));
const domain_routes_js_1 = __importDefault(require("./domain.routes.js"));
const import_routes_js_1 = __importDefault(require("./import.routes.js"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_js_1.default);
router.use('/students', student_routes_js_1.default);
router.use('/queue', queue_routes_js_1.default);
router.use('/panels', panel_routes_js_1.default);
router.use('/assignments', assignment_routes_js_1.default);
router.use('/interviews', interview_routes_js_1.default);
router.use('/admin', admin_routes_js_1.default);
router.use('/sessions', session_routes_js_1.default);
router.use('/domains', domain_routes_js_1.default);
router.use('/import', import_routes_js_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map