import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Domain } from '../models/Domain.js';
import { Interviewer } from '../models/Interviewer.js';
import { Panel } from '../models/Panel.js';
import { Student } from '../models/Student.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { QueueEntry } from '../models/QueueEntry.js';
import { Assignment } from '../models/Assignment.js';
import { EventLog } from '../models/EventLog.js';

export async function seedDatabase() {
  console.log('🌱 Starting PanelFlow database seed...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Domain.deleteMany({}),
    Interviewer.deleteMany({}),
    Panel.deleteMany({}),
    Student.deleteMany({}),
    InterviewSession.deleteMany({}),
    QueueEntry.deleteMany({}),
    Assignment.deleteMany({}),
    EventLog.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database records.');

  // 1. Create Domains
  const domainData = [
    { name: 'AR/VR', color: '#8B5CF6', description: 'Augmented & Virtual Reality, Unity, Unreal' },
    { name: 'IoT', color: '#10B981', description: 'Internet of Things, Embedded systems, Hardware' },
    { name: 'ML', color: '#EC4899', description: 'Machine Learning, AI, Deep Learning, PyTorch' },
    { name: 'Web', color: '#3B82F6', description: 'Fullstack Web Development, React, Node.js' },
    { name: 'Android', color: '#22C55E', description: 'Android Application Development, Kotlin, Flutter' },
    { name: 'Cybersecurity', color: '#EF4444', description: 'Network Security, Ethical Hacking, Cryptography' },
    { name: 'Game Development', color: '#F59E0B', description: 'Game Mechanics, Physics, 3D Modeling' },
    { name: 'Cloud', color: '#06B6D4', description: 'AWS, GCP, Docker, Kubernetes, CI/CD' },
    { name: 'Data Science', color: '#6366F1', description: 'Data Analytics, Visualization, SQL' },
    { name: 'UI/UX', color: '#F97316', description: 'Design Systems, Figma, User Research' },
    { name: 'Backend', color: '#14B8A6', description: 'Distributed Systems, Databases, Microservices' },
    { name: 'Frontend', color: '#E11D48', description: 'Modern UI Engineering, CSS Architecture, Performance' },
  ];

  const createdDomains = await Domain.insertMany(domainData);
  const domainMap = new Map<string, mongoose.Types.ObjectId>();
  createdDomains.forEach((d) => domainMap.set(d.name, d._id as mongoose.Types.ObjectId));

  console.log(`✅ Created ${createdDomains.length} domains.`);

  // 2. Create Active Interview Session
  const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
  const adminUser = await User.create({
    name: 'Chief Coordinator (Admin)',
    email: 'admin@panelflow.com',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
  });

  const session = await InterviewSession.create({
    sessionName: 'Club Recruitment 2026',
    description: 'Annual Technical & Core Domain Recruitment Drive',
    status: 'ACTIVE',
    startedAt: new Date(),
    createdBy: adminUser._id,
    settings: {
      allowStudentRegistration: true,
      allowReassignment: true,
      showEstimatedWait: true,
      strictPanelAvailability: true,
      defaultDurationMinutes: 15,
    },
  });

  console.log(`✅ Created active session: "${session.sessionName}"`);

  // 3. Create Interviewers & Panels
  // Panel P1: Rahul (AR/VR), Ankit (IoT), Priya (ML)
  const interviewerP1_1 = await Interviewer.create({
    name: 'Rahul Sharma',
    email: 'rahul.arvr@panelflow.club',
    domains: [domainMap.get('AR/VR')!],
  });
  const interviewerP1_2 = await Interviewer.create({
    name: 'Ankit Verma',
    email: 'ankit.iot@panelflow.club',
    domains: [domainMap.get('IoT')!],
  });
  const interviewerP1_3 = await Interviewer.create({
    name: 'Priya Joshi',
    email: 'priya.ml@panelflow.club',
    domains: [domainMap.get('ML')!],
  });

  const panel1 = await Panel.create({
    panelCode: 'P1',
    name: 'Panel 1 — Advanced Tech',
    roomLocation: 'Room 301, Lab Building',
    interviewerIds: [interviewerP1_1._id, interviewerP1_2._id, interviewerP1_3._id],
    status: 'AVAILABLE',
  });
  await Interviewer.updateMany(
    { _id: { $in: [interviewerP1_1._id, interviewerP1_2._id, interviewerP1_3._id] } },
    { panelId: panel1._id }
  );

  // Panel P2: Karan (Web), Aman (Android), Riya (Cybersecurity)
  const interviewerP2_1 = await Interviewer.create({
    name: 'Karan Patel',
    email: 'karan.web@panelflow.club',
    domains: [domainMap.get('Web')!],
  });
  const interviewerP2_2 = await Interviewer.create({
    name: 'Aman Singh',
    email: 'aman.android@panelflow.club',
    domains: [domainMap.get('Android')!],
  });
  const interviewerP2_3 = await Interviewer.create({
    name: 'Riya Sen',
    email: 'riya.cyber@panelflow.club',
    domains: [domainMap.get('Cybersecurity')!],
  });

  const panel2 = await Panel.create({
    panelCode: 'P2',
    name: 'Panel 2 — Software & Security',
    roomLocation: 'Room 302, Lab Building',
    interviewerIds: [interviewerP2_1._id, interviewerP2_2._id, interviewerP2_3._id],
    status: 'AVAILABLE',
  });
  await Interviewer.updateMany(
    { _id: { $in: [interviewerP2_1._id, interviewerP2_2._id, interviewerP2_3._id] } },
    { panelId: panel2._id }
  );

  // Panel P3: Dev (Backend), Neha (Frontend), Arjun (Game Dev)
  const interviewerP3_1 = await Interviewer.create({
    name: 'Dev Malhotra',
    email: 'dev.backend@panelflow.club',
    domains: [domainMap.get('Backend')!, domainMap.get('Cloud')!],
  });
  const interviewerP3_2 = await Interviewer.create({
    name: 'Neha Gupta',
    email: 'neha.frontend@panelflow.club',
    domains: [domainMap.get('Frontend')!, domainMap.get('UI/UX')!],
  });
  const interviewerP3_3 = await Interviewer.create({
    name: 'Arjun Das',
    email: 'arjun.game@panelflow.club',
    domains: [domainMap.get('Game Development')!],
  });

  const panel3 = await Panel.create({
    panelCode: 'P3',
    name: 'Panel 3 — Engineering & Design',
    roomLocation: 'Room 303, Lab Building',
    interviewerIds: [interviewerP3_1._id, interviewerP3_2._id, interviewerP3_3._id],
    status: 'PAUSED',
  });
  await Interviewer.updateMany(
    { _id: { $in: [interviewerP3_1._id, interviewerP3_2._id, interviewerP3_3._id] } },
    { panelId: panel3._id }
  );

  // Panel P4 (Offline)
  const panel4 = await Panel.create({
    panelCode: 'P4',
    name: 'Panel 4 — Reserve Panel',
    roomLocation: 'Room 304, Lab Building',
    interviewerIds: [],
    status: 'OFFLINE',
  });

  // Create Panel User accounts for direct panel logins
  await User.create([
    { name: 'Panel P1 User', email: 'panel-p1@panelflow.local', role: 'PANEL', panelId: panel1._id },
    { name: 'Panel P2 User', email: 'panel-p2@panelflow.local', role: 'PANEL', panelId: panel2._id },
    { name: 'Panel P3 User', email: 'panel-p3@panelflow.local', role: 'PANEL', panelId: panel3._id },
    { name: 'Panel P4 User', email: 'panel-p4@panelflow.local', role: 'PANEL', panelId: panel4._id },
  ]);

  console.log('✅ Created Panels P1, P2, P3, P4 and panel interviewer accounts.');

  // 4. Create Students with Domain Preferences
  const sampleStudents = [
    {
      registrationNumber: '24BCE1001',
      name: 'Ayush Saroj',
      email: 'ayush.saroj@student.college.edu',
      branch: 'CSE',
      year: 1,
      phone: '+91 9876543210',
      domainPreferences: [
        { domainId: domainMap.get('AR/VR')!, priority: 1 },
        { domainId: domainMap.get('Web')!, priority: 2 },
        { domainId: domainMap.get('Android')!, priority: 3 },
      ],
    },
    {
      registrationNumber: '24BCE1002',
      name: 'Rahul Mishra',
      email: 'rahul.mishra@student.college.edu',
      branch: 'CSE (AI/ML)',
      year: 1,
      phone: '+91 9876543211',
      domainPreferences: [
        { domainId: domainMap.get('Web')!, priority: 1 },
        { domainId: domainMap.get('Android')!, priority: 2 },
        { domainId: domainMap.get('ML')!, priority: 3 },
      ],
    },
    {
      registrationNumber: '24BCE1003',
      name: 'Priya Sharma',
      email: 'priya.sharma@student.college.edu',
      branch: 'IT',
      year: 1,
      phone: '+91 9876543212',
      domainPreferences: [
        { domainId: domainMap.get('ML')!, priority: 1 },
        { domainId: domainMap.get('IoT')!, priority: 2 },
        { domainId: domainMap.get('AR/VR')!, priority: 3 },
      ],
    },
    {
      registrationNumber: '24BCE1004',
      name: 'Karan Mehra',
      email: 'karan.mehra@student.college.edu',
      branch: 'ECE',
      year: 1,
      phone: '+91 9876543213',
      domainPreferences: [
        { domainId: domainMap.get('Android')!, priority: 1 },
        { domainId: domainMap.get('Web')!, priority: 2 },
        { domainId: domainMap.get('AR/VR')!, priority: 3 },
      ],
    },
    {
      registrationNumber: '24BCE1005',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@student.college.edu',
      branch: 'CSE',
      year: 1,
      phone: '+91 9876543214',
      domainPreferences: [
        { domainId: domainMap.get('Cybersecurity')!, priority: 1 },
        { domainId: domainMap.get('Web')!, priority: 2 },
        { domainId: domainMap.get('IoT')!, priority: 3 },
      ],
    },
    {
      registrationNumber: '24BCE1006',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@student.college.edu',
      branch: 'CSE (Data Science)',
      year: 1,
      phone: '+91 9876543215',
      domainPreferences: [
        { domainId: domainMap.get('Cloud')!, priority: 1 },
        { domainId: domainMap.get('Backend')!, priority: 2 },
        { domainId: domainMap.get('Data Science')!, priority: 3 },
      ],
    },
  ];

  for (let i = 0; i < sampleStudents.length; i++) {
    const sData = sampleStudents[i];
    const student = await Student.create({
      ...sData,
      status: 'IN_QUEUE',
    });

    const queueNumber = i + 1;
    const joinedAt = new Date(Date.now() - (sampleStudents.length - i) * 60000);

    const queueEntry = await QueueEntry.create({
      sessionId: session._id,
      studentId: student._id,
      queueNumber,
      joinedAt,
      status: 'WAITING',
    });

    await EventLog.create({
      sessionId: session._id,
      actorRole: 'STUDENT',
      actorName: student.name,
      eventType: 'STUDENT_JOINED_QUEUE',
      entityType: 'QUEUE_ENTRY',
      entityId: queueEntry._id,
      metadata: {
        queueNumber,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
      },
      createdAt: joinedAt,
    });
  }

  console.log(`✅ Seeded ${sampleStudents.length} candidates in the FCFS waiting queue.`);
  console.log('🎉 Database seed completed successfully!');
}

// Execute directly if run via CLI
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
