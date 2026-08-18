import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = env.MONGODB_URI;

    if (!uri) {
      console.log('ℹ️  No MONGODB_URI provided in environment. Starting in-memory MongoDB instance for seamless zero-setup execution...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log(`📦 In-memory MongoDB running at: ${uri}`);
    } else {
      console.log(`🔗 Connecting to MongoDB Atlas / Remote database...`);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // If external URI failed in development mode, fallback to in-memory server
    if (env.NODE_ENV === 'development' && env.MONGODB_URI) {
      console.log('⚠️ Attempting fallback to in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback In-memory MongoDB Connected: ${fallbackUri}`);
        return;
      } catch (fallbackError) {
        console.error('❌ Failed to start in-memory fallback:', fallbackError);
      }
    }
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};
