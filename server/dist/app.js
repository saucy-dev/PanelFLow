"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security Middleware
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false, // Allows flexible cross-origin resources in local dev
    }));
    // CORS Configuration
    const allowedOrigins = [
        env_js_1.env.CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, true); // Allow flexible network access for testing on local network devices/tablets
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Body parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    // General rate limiter
    app.use('/api', rateLimiter_js_1.apiLimiter);
    // Health check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    // API Routes
    app.use('/api', index_js_1.default);
    // Centralized Error Handling
    app.use(error_middleware_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map