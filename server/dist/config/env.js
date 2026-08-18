"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config(); // fallback to local directory .env if any
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000').transform((v) => parseInt(v, 10)),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    MONGODB_URI: zod_1.z.string().optional().default(''),
    JWT_SECRET: zod_1.z.string().default('super_secret_panelflow_jwt_key_development_2026_change_in_production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    GOOGLE_CLIENT_EMAIL: zod_1.z.string().optional().default(''),
    GOOGLE_PRIVATE_KEY: zod_1.z.string().optional().default(''),
    GOOGLE_SHEET_ID: zod_1.z.string().optional().default(''),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map