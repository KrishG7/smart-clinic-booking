/**
 * Auth Controller Tests
 * Tests registration, login, OTP flow, profile, and admin endpoints
 */

const request = require('supertest');
const app = require('../app');

// ── Mock the database module so no real MySQL is needed ──────────────────────
jest.mock('../config/database', () => {
  const mockPool = { end: jest.fn() };
  return {
    pool: mockPool,
    connectDB: jest.fn().mockResolvedValue(mockPool),
    query: jest.fn(),
    transaction: jest.fn(),
  };
});

// ── Mock bcryptjs ────────────────────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// ── Mock OTP service ─────────────────────────────────────────────────────────
jest.mock('../utils/otpService', () => ({
  generateOTP: jest.fn().mockResolvedValue('123456'),
  verifyOTP: jest.fn(),
}));

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { verifyOTP } = require('../utils/otpService');
const { pool } = require('../config/database');

afterAll(async () => {
  pool.end();
});

beforeEach(() => {
  jest.clearAllMocks();
  query.mockReset();
  bcrypt.compare.mockReset();
  verifyOTP.mockReset();
  bcrypt.hash.mockReset();
  bcrypt.hash.mockResolvedValue('hashed_password');
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('registers a new patient successfully', async () => {
    query
      .mockResolvedValueOnce([])           // no existing user
      .mockResolvedValueOnce({ insertId: 42 }) // INSERT user
      .mockResolvedValueOnce({ insertId: 1 });  // INSERT patient

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Patient',
      phone: '9876543210',
      email: 'test@example.com',
      role: 'patient',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('patient');
  });

  test('registers a new doctor with pending approval', async () => {
    query
      .mockResolvedValueOnce([])           // no existing user
      .mockResolvedValueOnce({ insertId: 10 }) // INSERT user
      .mockResolvedValueOnce({ insertId: 2 });  // INSERT doctor

    const res = await request(app).post('/api/auth/register').send({
      name: 'Dr Smith',
      phone: '9876543211',
      role: 'doctor',
      password: 'password123',
      specialization: 'Cardiology',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.pendingApproval).toBe(true);
    expect(res.body.token).toBeUndefined(); // doctors don't get token until approved
  });

  test('rejects registration if phone already exists', async () => {
    query.mockResolvedValueOnce([{ id: 1 }]); // existing user found

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Patient',
      phone: '9876543210',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  test('rejects registration without password', async () => {
    query.mockResolvedValueOnce([]); // no existing user

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Patient',
      phone: '9876543210',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })])
    );
  });

  test('rejects registration with invalid phone format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Patient',
      phone: '123', // too short
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'phone' })])
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('logs in a valid patient', async () => {
    query.mockResolvedValueOnce([
      { id: 1, name: 'Test', phone: '9876543210', email: null, role: 'patient', is_active: true, password_hash: 'hashed' }
    ]);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app).post('/api/auth/login').send({
      phone: '9876543210',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    query.mockResolvedValueOnce([
      { id: 1, phone: '9876543210', role: 'patient', is_active: true, password_hash: 'hashed' }
    ]);
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/auth/login').send({
      phone: '9876543210',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects login if user not found', async () => {
    query.mockResolvedValueOnce([]);

    const res = await request(app).post('/api/auth/login').send({
      phone: '0000000000',
      password: 'password123',
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('rejects login for unapproved doctor', async () => {
    query.mockResolvedValueOnce([
      { id: 2, phone: '9876543211', role: 'doctor', is_active: false, password_hash: 'hashed' }
    ]);

    const res = await request(app).post('/api/auth/login').send({
      phone: '9876543211',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('pending admin approval');
  });

  test('returns 400 if phone or password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/send-otp', () => {
  test('sends OTP successfully and returns expiresIn', async () => {
    // generateOTP mock handles DB internally via jest.mock('../utils/otpService')
    const res = await request(app).post('/api/auth/send-otp').send({ phone: '9876543210' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent');
    // otp field only appears in NODE_ENV=development; jest uses 'test' — absence is correct
    expect(res.body.expiresIn).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/verify-otp', () => {
  test('verifies OTP and returns token', async () => {
    verifyOTP.mockResolvedValueOnce(true);
    // verifyOTPAndLogin queries: SELECT * FROM users WHERE phone = ?
    query.mockResolvedValueOnce([
      { id: 1, name: 'Test', phone: '9876543210', email: null, role: 'patient', is_active: true }
    ]);

    const res = await request(app).post('/api/auth/verify-otp').send({
      phone: '9876543210',
      otp: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('patient');
  });

  test('rejects invalid OTP', async () => {
    verifyOTP.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/auth/verify-otp').send({
      phone: '9876543210',
      otp: '000000',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects if user not found after OTP verify', async () => {
    verifyOTP.mockResolvedValueOnce(true);
    // SELECT * FROM users returns empty array
    query.mockResolvedValueOnce([]);

    const res = await request(app).post('/api/auth/verify-otp').send({
      phone: '9999999999',
      otp: '123456',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  test('rejects OTP shorter than 6 digits', async () => {
    const res = await request(app).post('/api/auth/verify-otp').send({
      phone: '9876543210',
      otp: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'otp' })])
    );
  });
});
