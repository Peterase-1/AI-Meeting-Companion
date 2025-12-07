import request from 'supertest';
import app from '../index'; // Import the running app but NOT listening
import { prisma } from '../lib/prisma';

// Use a pseudo-random email for every test run to avoid collisions
const TEST_EMAIL = `jest_${Math.random().toString(36).substring(7)}@example.com`;
const TEST_PASSWORD = 'password123';
let authToken = '';
let userId = '';
let meetingId = '';

// Sample transcript for testing
const SAMPLE_TRANSCRIPT = `
Meeting Title: Project Kickoff
Date: 2023-10-27
Attendees: Alice (PM), Bob (Dev), Carol (Designer)

Alice: Welcome everyone. The goal today is to plan the Q4 dashboard features.
Bob: I can start on the backend API next week. I'll need the schema by Monday.
Carol: I'll have the high-fidelity mocks ready by Wednesday.
Alice: Great. Let's aim for a code freeze by Dec 15th.
Bob: Is there a specific tech stack?
Alice: Yes, we are using React and Node.js.
Alice: Action item: Bob to set up the repo.
Alice: Decision: We will use tailwind for styling.
`;

describe('E2E Workflow', () => {
  // Cleanup before we rely on data (optional, but good practice)
  beforeAll(async () => {
    // wait for db connection if needed
  });

  afterAll(async () => {
    // deep cleanup
    if (userId) {
      await prisma.meeting.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Jest Tester'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
  });

  it('should login and retrieve a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  it('should upload a meeting and perform AI analysis', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Jest Test Meeting',
        date: new Date().toISOString(),
        transcript: SAMPLE_TRANSCRIPT
      });

    // Expect 201 Created
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('short');

    // Check nested AI data
    expect(res.body).toHaveProperty('actionItems');
    expect(Array.isArray(res.body.actionItems)).toBe(true);

    meetingId = res.body.id;
  }, 30000); // Extended timeout for AI latency

  it('should generate an action plan', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/action-plan`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('goals');
    expect(res.body).toHaveProperty('tasks');
  }, 20000);

  it('should cluster topics', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/topics`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('topics');
    expect(Array.isArray(res.body.topics)).toBe(true);
  }, 20000);

  it('should answer a chat question', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/chat`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: "What is the tech stack?" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body.answer).toMatch(/React|Node/i);
  }, 20000);

  it('should generate slides', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/generate/slides`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('slides');
    expect(Array.isArray(res.body.slides)).toBe(true);
  }, 20000);

  it('should generate a technical spec document', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/generate/technical_spec`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(typeof res.body.content).toBe('string');
  }, 20000);

});
