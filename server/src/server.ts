import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocketServer } from './sockets/socketHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed/seedData.js';

async function bootstrap() {
  console.log('🚀 Starting PanelFlow Server...');

  // 1. Connect to Database (Atlas or In-Memory fallback)
  await connectDB();

  // 2. Auto-seed if database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('📦 Empty database detected. Auto-populating development seed data...');
    await seedDatabase();
  }

  // 3. Create Express App and HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // 4. Initialize Socket.IO Server
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  initSocketServer(io);

  // 5. Start Listening
  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🎉 PanelFlow Backend Server Running!`);
    console.log(`🌐 URL: http://localhost:${env.PORT}`);
    console.log(`📡 Socket.IO initialized and ready`);
    console.log(`🔒 Mode: ${env.NODE_ENV}`);
    console.log(`======================================================\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
