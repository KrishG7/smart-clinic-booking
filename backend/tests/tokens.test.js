/**
 * Token Controller Tests
 * Tests live queue management: getQueue, callNext, emergency, checkIn, skip
 */

const request = require('supertest');
const app = require('../app');
const { generateToken } = require('../config/auth');

// ── Mock database ────────────────────────────────────────────────────────────
jest.mock('../config/database', () => {
  const mockPool = { end: jest.fn() };
  return {
    pool: mockPool,
    connectDB: jest.fn().mockResolvedValue(mockPool),
    query: jest.fn(),
    transaction: jest.fn(),
  };
});

const { query } = require('../config/database');
const { pool } = require('../config/database');

const patientToken = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test Patient' });
const doctorToken  = generateToken({ id: 2, phone: '9876543211', role: 'doctor',  name: 'Dr Smith'     });

afterAll(async () => { pool.end(); });
beforeEach(() => { 
  jest.clearAllMocks(); 
  query.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/tokens/queue/:doctorId', () => {
  test('returns queue for a doctor', async () => {
    const Token = require('../models/Token');
    const origQueue = Token.getQueue;
    const origCurrent = Token.getCurrentToken;

    Token.getQueue = jest.fn().mockResolvedValue([
      { id: 1, token_number: 1, patient_name: 'Alice', patient_phone: '1111111111',
        status: 'waiting', type: 'regular', queue_position: 1, estimated_wait_minutes: 0, check_in_time: null }
    ]);
    Token.getCurrentToken = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .get('/api/tokens/queue/1')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.queueLength).toBe(1);
    expect(res.body.queue[0].tokenNumber).toBe(1);

    Token.getQueue = origQueue;
    Token.getCurrentToken = origCurrent;
  });

  test('includes current token in response when present', async () => {
    const Token = require('../models/Token');
    const origQueue = Token.getQueue;
    const origCurrent = Token.getCurrentToken;

    Token.getQueue = jest.fn().mockResolvedValue([]);
    Token.getCurrentToken = jest.fn().mockResolvedValue({
      token_number: 5, patient_name: 'Bob', status: 'in_progress'
    });

    const res = await request(app)
      .get('/api/tokens/queue/1')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.currentToken.tokenNumber).toBe(5);
    expect(res.body.currentToken.patientName).toBe('Bob');

    Token.getQueue = origQueue;
    Token.getCurrentToken = origCurrent;
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/tokens/queue/1');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/tokens/next', () => {
  test('doctor can call next patient', async () => {
    query.mockResolvedValueOnce([{ id: 1 }]); // doctor lookup
    const Token = require('../models/Token');
    const orig = Token.callNext;
    Token.callNext = jest.fn().mockResolvedValue({
      id: 1, token_number: 2, patient_name: 'Carol', patient_phone: '2222222222', status: 'in_progress'
    });

    const res = await request(app)
      .post('/api/tokens/next')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ doctorId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.nextToken.tokenNumber).toBe(2);
    expect(res.body.nextToken.patientName).toBe('Carol');

    Token.callNext = orig;
  });

  test('returns message when queue is empty', async () => {
    query.mockResolvedValueOnce([{ id: 1 }]); // doctor lookup
    const Token = require('../models/Token');
    const orig = Token.callNext;
    Token.callNext = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post('/api/tokens/next')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ doctorId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.nextToken).toBeNull();
    expect(res.body.message).toContain('No more patients');

    Token.callNext = orig;
  });

  test('returns 400 when doctorId is missing', async () => {
    const res = await request(app)
      .post('/api/tokens/next')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Doctor ID is required');
  });

  test('patient cannot call next (403)', async () => {
    const res = await request(app)
      .post('/api/tokens/next')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId: 1 });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/tokens/emergency', () => {
  test('doctor can issue emergency token', async () => {
    query.mockResolvedValueOnce([{ id: 1 }]); // doctor lookup
    const Token = require('../models/Token');
    const orig = Token.emergencyInterrupt;
    Token.emergencyInterrupt = jest.fn().mockResolvedValue({
      id: 99, token_number: 100, type: 'emergency', status: 'emergency'
    });

    const res = await request(app)
      .post('/api/tokens/emergency')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ doctorId: 1, patientId: 5 });

    expect(res.status).toBe(201);
    expect(res.body.token.type).toBe('emergency');

    Token.emergencyInterrupt = orig;
  });

  test('returns 400 when doctorId or patientId is missing', async () => {
    const res = await request(app)
      .post('/api/tokens/emergency')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ doctorId: 1 }); // missing patientId

    expect(res.status).toBe(400);
  });

  test('patient cannot issue emergency (403)', async () => {
    const res = await request(app)
      .post('/api/tokens/emergency')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId: 1, patientId: 5 });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/tokens/:id/checkin', () => {
  test('successful check-in when within geofence', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    query.mockResolvedValueOnce([{ patient_id: 5 }]); // token lookup
    const Token = require('../models/Token');
    const orig = Token.checkIn;
    Token.checkIn = jest.fn().mockResolvedValue({
      id: 1, token_number: 1, check_in_time: new Date().toISOString()
    });

    // Use clinic coords (default 28.6139, 77.2090) — within 200m of itself
    const res = await request(app)
      .post('/api/tokens/1/checkin')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ latitude: 28.6139, longitude: 77.2090 });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Check-in successful');

    Token.checkIn = orig;
  });

  test('rejects check-in when outside geofence', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    query.mockResolvedValueOnce([{ patient_id: 5 }]); // token lookup
    const res = await request(app)
      .post('/api/tokens/1/checkin')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ latitude: 40.7128, longitude: -74.0060 }); // New York City

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('away');
  });

  test('returns 404 when token not found', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    query.mockResolvedValueOnce([]); // token lookup
    const Token = require('../models/Token');
    const orig = Token.checkIn;
    Token.checkIn = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post('/api/tokens/9999/checkin')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({}); // no GPS, skip geofence

    expect(res.status).toBe(404);
    Token.checkIn = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/tokens/:id/skip', () => {
  test('doctor can skip a token', async () => {
    const Token = require('../models/Token');
    const orig = Token.skip;
    Token.skip = jest.fn().mockResolvedValue({ id: 1, status: 'skipped' });

    const res = await request(app)
      .post('/api/tokens/1/skip')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.token.status).toBe('skipped');
    Token.skip = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/tokens/stats/:doctorId', () => {
  test('returns today token stats', async () => {
    query.mockResolvedValueOnce([{ id: 1 }]); // doctor lookup
    const Token = require('../models/Token');
    const orig = Token.getTodayStats;
    Token.getTodayStats = jest.fn().mockResolvedValue({
      total: 20, completed: 12, waiting: 6, in_progress: 1, skipped: 1, emergencies: 0
    });

    const res = await request(app)
      .get('/api/tokens/stats/1')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(20);
    Token.getTodayStats = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/tokens/my', () => {
  test('returns my tokens for today', async () => {
    query.mockResolvedValueOnce([{ id: 10 }]); // patient lookup

    const Token = require('../models/Token');
    const orig = Token.findByPatientToday;
    Token.findByPatientToday = jest.fn().mockResolvedValue([
      { id: 1, token_number: 3, doctor_name: 'Dr Smith', specialization: 'General' }
    ]);

    const res = await request(app)
      .get('/api/tokens/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tokens).toHaveLength(1);
    Token.findByPatientToday = orig;
  });

  test('returns 404 when patient profile not found', async () => {
    query.mockResolvedValueOnce([]); // no patient

    const res = await request(app)
      .get('/api/tokens/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
  });
});
