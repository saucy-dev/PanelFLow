"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_js_1 = require("./app.js");
const db_js_1 = require("./config/db.js");
const env_js_1 = require("./config/env.js");
const socketHandler_js_1 = require("./sockets/socketHandler.js");
const User_js_1 = require("./models/User.js");
const seedData_js_1 = require("./seed/seedData.js");
async function bootstrap() {
    console.log('🚀 Starting PanelFlow Server...');
    // 1. Connect to Database (Atlas or In-Memory fallback)
    await (0, db_js_1.connectDB)();
    // 2. Auto-seed if database is empty
    const userCount = await User_js_1.User.countDocuments();
    if (userCount === 0) {
        console.log('📦 Empty database detected. Auto-populating development seed data...');
        await (0, seedData_js_1.seedDatabase)();
    }
    // 3. Create Express App and HTTP Server
    const app = (0, app_js_1.createApp)();
    const server = http_1.default.createServer(app);
    // 4. Initialize Socket.IO Server
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    (0, socketHandler_js_1.initSocketServer)(io);
    // 5. Start Listening
    server.listen(env_js_1.env.PORT, () => {
        console.log(`\n======================================================`);
        console.log(`🎉 PanelFlow Backend Server Running!`);
        console.log(`🌐 URL: http://localhost:${env_js_1.env.PORT}`);
        console.log(`📡 Socket.IO initialized and ready`);
        console.log(`🔒 Mode: ${env_js_1.env.NODE_ENV}`);
        console.log(`======================================================\n`);
    });
}
bootstrap().catch((err) => {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map