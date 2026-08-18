"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
let mongoMemoryServer = null;
const connectDB = async () => {
    try {
        let uri = env_js_1.env.MONGODB_URI;
        if (!uri) {
            console.log('ℹ️  No MONGODB_URI provided in environment. Starting in-memory MongoDB instance for seamless zero-setup execution...');
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            mongoMemoryServer = await MongoMemoryServer.create();
            uri = mongoMemoryServer.getUri();
            console.log(`📦 In-memory MongoDB running at: ${uri}`);
        }
        else {
            console.log(`🔗 Connecting to MongoDB Atlas / Remote database...`);
        }
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected Successfully: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        // If external URI failed in development mode, fallback to in-memory server
        if (env_js_1.env.NODE_ENV === 'development' && env_js_1.env.MONGODB_URI) {
            console.log('⚠️ Attempting fallback to in-memory MongoDB server...');
            try {
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                mongoMemoryServer = await MongoMemoryServer.create();
                const fallbackUri = mongoMemoryServer.getUri();
                await mongoose_1.default.connect(fallbackUri);
                console.log(`✅ Fallback In-memory MongoDB Connected: ${fallbackUri}`);
                return;
            }
            catch (fallbackError) {
                console.error('❌ Failed to start in-memory fallback:', fallbackError);
            }
        }
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongoMemoryServer) {
            await mongoMemoryServer.stop();
        }
    }
    catch (error) {
        console.error('Error disconnecting database:', error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map