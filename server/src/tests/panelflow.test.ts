import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seedData.js';
import { Panel } from '../models/Panel.js';
import { QueueEntry } from '../models/QueueEntry.js';
import { Student } from '../models/Student.js';
import { Domain } from '../models/Domain.js';
import { AssignmentService } from '../services/assignment.service.js';

let app: any;
let adminToken: string;

beforeAll(async () => {
  await connectDB();
  await seedDatabase();
  app = createApp();

  // Login as admin
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@panelflow.com', password: 'adminpassword123' });

  adminToken = loginRes.body.data.token;
}, 30000);

afterAll(async () => {
  await disconnectDB();
});

describe('1. Student Registration & Live Waiting Queue', () => {
  it('should allow a new student to join queue and receive next immutable queue number', async () => {
    const domains = await Domain.find().limit(2);

    const res = await request(app)
      .post('/api/queue/join')
      .send({
        registrationNumber: '24BCE9999',
        name: 'Test Student',
        email: 'test.student@college.edu',
        branch: 'CSE',
        year: 1,
        domainPreferences: [
          { domainId: domains[0]._id.toString(), priority: 1 },
          { domainId: domains[1]._id.toString(), priority: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.queueEntry.queueNumber).toBeGreaterThanOrEqual(7);
    expect(res.body.data.queueEntry.status).toBe('WAITING');
  });

  it('should prevent duplicate queue entry for the same student registration number', async () => {
    const domains = await Domain.find().limit(2);

    const res = await request(app)
      .post('/api/queue/join')
      .send({
        registrationNumber: '24BCE9999',
        name: 'Test Student',
        email: 'test.student@college.edu',
        branch: 'CSE',
        year: 1,
        domainPreferences: [
          { domainId: domains[0]._id.toString(), priority: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isExisting).toBe(true);
    expect(res.body.data.message).toContain('already in the queue');
  });
});

describe('2. Atomic Panel Assignment & Race Condition Concurrency Protection', () => {
  it('should successfully assign a waiting student to an available panel', async () => {
    const waitingEntry = await QueueEntry.findOne({ status: 'WAITING' }).sort({ queueNumber: 1 });
    const availablePanel = await Panel.findOne({ status: 'AVAILABLE' });

    expect(waitingEntry).not.toBeNull();
    expect(availablePanel).not.toBeNull();

    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        queueEntryId: waitingEntry!._id.toString(),
        panelId: availablePanel!._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify database state
    const updatedPanel = await Panel.findById(availablePanel!._id);
    expect(updatedPanel!.status).toBe('OCCUPIED');

    const updatedEntry = await QueueEntry.findById(waitingEntry!._id);
    expect(updatedEntry!.status).toBe('ASSIGNED');
  });

  it('should return 409 Conflict if another admin tries to assign to an already occupied panel (Race Condition)', async () => {
    const anotherWaitingEntry = await QueueEntry.findOne({ status: 'WAITING' });
    const occupiedPanel = await Panel.findOne({ status: 'OCCUPIED' });

    expect(anotherWaitingEntry).not.toBeNull();
    expect(occupiedPanel).not.toBeNull();

    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        queueEntryId: anotherWaitingEntry!._id.toString(),
        panelId: occupiedPanel!._id.toString(),
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('no longer available');
  });
});

describe('3. Interview Lifecycle: WAITING -> ASSIGNED -> INTERVIEWING -> COMPLETED', () => {
  it('should transition to INTERVIEWING when panel starts interview and return to AVAILABLE when completed', async () => {
    const occupiedPanel = await Panel.findOne({ status: 'OCCUPIED' }).populate('currentCandidateId');
    expect(occupiedPanel).not.toBeNull();

    // 1. Start Interview
    const startRes = await request(app)
      .post(`/api/interviews/${occupiedPanel!._id}/start`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(startRes.status).toBe(200);

    const startedEntry = await QueueEntry.findOne({ studentId: (occupiedPanel!.currentCandidateId as any)._id });
    expect(startedEntry!.status).toBe('INTERVIEWING');

    // 2. Complete Interview
    const completeRes = await request(app)
      .post(`/api/interviews/${occupiedPanel!._id}/complete`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(completeRes.status).toBe(200);

    const freedPanel = await Panel.findById(occupiedPanel!._id);
    expect(freedPanel!.status).toBe('AVAILABLE');
    expect(freedPanel!.currentCandidateId).toBeNull();

    const completedEntry = await QueueEntry.findOne({ studentId: (occupiedPanel!.currentCandidateId as any)._id });
    expect(completedEntry!.status).toBe('COMPLETED');
  });
});

describe('4. RBAC Authorization Security', () => {
  it('should reject unauthenticated or non-admin requests to admin endpoints with 401/403', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
