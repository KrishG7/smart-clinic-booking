const express = require('express');
const request = require('supertest');

const app = require('../app');
const { pool } = require('../config/database');
const errorHandler = require('../middleware/errorHandler');

afterAll(async () => {
  await pool.end();
});

describe('App routes', () => {
  test('GET /api/health returns service metadata', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('running'),
        environment: expect.any(String),
      })
    );
  });

  test('GET / returns API metadata', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Smart Clinic Booking API',
        version: '1.0.0',
      })
    );
    expect(response.body.endpoints).toEqual(
      expect.objectContaining({
        health: '/api/health',
        auth: '/api/auth',
      })
    );
  });

  test('GET /api/nonexistent returns a structured 404', async () => {
    const response = await request(app).get('/api/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route GET /api/nonexistent not found',
    });
  });
});

describe('Validation middleware', () => {
  test('POST /api/auth/register rejects malformed payloads', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      phone: '1234',
      email: 'not-an-email',
      role: 'owner',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'phone' }),
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'role' }),
      ])
    );
  });

  test('POST /api/auth/login requires phone and password', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'phone', message: 'Phone number is required' }),
        expect.objectContaining({ field: 'password', message: 'Password is required' }),
      ])
    );
  });

  test('POST /api/auth/verify-otp enforces a 6-digit OTP', async () => {
    const response = await request(app).post('/api/auth/verify-otp').send({
      phone: '9876543210',
      otp: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'otp', message: 'OTP must be 6 digits' }),
      ])
    );
  });
});

describe('Error handler', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  function createErrorApp(error) {
    const errorApp = express();
    errorApp.get('/boom', (req, res, next) => next(error));
    errorApp.use(errorHandler);
    return errorApp;
  }

  test('maps JWT errors to 401 responses', async () => {
    const response = await request(
      createErrorApp({ name: 'JsonWebTokenError', message: 'bad token' })
    ).get('/boom');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Invalid authentication token',
    });
  });

  test('maps duplicate entry database errors to 409 responses', async () => {
    const response = await request(
      createErrorApp({ code: 'ER_DUP_ENTRY', message: 'duplicate row' })
    ).get('/boom');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: 'A record with this information already exists',
    });
  });
});
