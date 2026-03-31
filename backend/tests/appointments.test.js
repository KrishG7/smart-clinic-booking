/**
 * Appointment Controller Tests
 * Tests booking, retrieval, status updates, and cancellations
 */

const request = require('supertest');
const app = require('../app');
const { generateToken } = require('../config/auth');

// ── Mock database ─────────────────────────────────────────────────────────────
jest.mock('../config/database', () => {
  const mockPool = { end: jest.fn() };
  return {
    pool: mockPool,
    connectDB: jest.fn().mockResolvedValue(mockPool),
    query: jest.fn(),
    transaction: jest.fn(),
  };
});

// ── Mock Appointment model (all static methods become jest.fn()) ───────────────
jest.mock('../models/Appointment', () => ({
  findByLocalId: jest.fn(),
  findByPatient: jest.fn(),
  findById: jest.fn(),
  findByDoctor: jest.fn(),
  updateStatus: jest.fn(),
  cancel: jest.fn(),
  getTodayStats: jest.fn(),
  create: jest.fn(),
  updateSyncStatus: jest.fn(),
}));

const { query, transaction } = require('../config/database');
const { pool } = require('../config/database');
const Appointment = require('../models/Appointment');

const patientToken = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test Patient' });
const doctorToken  = generateToken({ id: 2, phone: '9876543211', role: 'doctor',  name: 'Dr Smith'     });
const adminToken   = generateToken({ id: 3, phone: '9876543212', role: 'admin',   name: 'Admin User'   });

afterAll(async () => { pool.end(); });
beforeEach(() => { jest.clearAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/appointments', () => {
  const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  test('books an appointment successfully for a patient', async () => {
    Appointment.findByLocalId.mockResolvedValue(null); // not duplicate

    transaction.mockImplementationOnce(async (cb) => {
      const conn = {
        execute: jest.fn()
          .mockResolvedValueOnce([[{ nextNum: 1 }]])    // tokenNo for appointment
          .mockResolvedValueOnce([{ insertId: 100 }])   // insert appointment
          .mockResolvedValueOnce([[{ nextNum: 1 }]])    // next token number
          .mockResolvedValueOnce([[{ position: 1 }]])   // queue position
          .mockResolvedValueOnce([[{ insertId: 50 }]])  // insert token
      };
      return cb(conn);
    });

    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 1,
        appointmentDate: TOMORROW,
        appointmentTime: '10:00:00',
        type: 'regular',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment).toBeDefined();
    expect(res.body.token.tokenNumber).toBeDefined();
  });

  test('rejects booking without required fields (validator)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId: 1 }); // missing appointmentDate + appointmentTime

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects booking for past date', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 1,
        appointmentDate: '2020-01-01',
        appointmentTime: '10:00:00',
        reason: 'Checkup',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('future');
  });

  test('rejects booking without auth token', async () => {
    const res = await request(app).post('/api/appointments').send({
      doctorId: 1,
      appointmentDate: TOMORROW,
      appointmentTime: '10:00:00',
    });

    expect(res.status).toBe(401);
  });

  test('returns already-synced appointment if duplicate localId', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    Appointment.findByLocalId.mockResolvedValue({ id: 77, token_no: 2 });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 1,
        appointmentDate: TOMORROW,
        appointmentTime: '10:00:00',
        localId: 'abc-123',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('already synced');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/appointments/my', () => {
  test('returns appointments for logged-in patient', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    Appointment.findByPatient.mockResolvedValue([
      { id: 1, appointment_date: '2025-06-01', status: 'booked' }
    ]);

    const res = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.appointments).toHaveLength(1);
  });

  test('returns 404 if patient profile does not exist', async () => {
    query.mockResolvedValueOnce([]); // no patient found

    const res = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Patient profile not found');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/appointments/:id', () => {
  test('returns appointment by ID', async () => {
    Appointment.findById.mockResolvedValue({
      id: 1, appointment_date: '2025-06-01', status: 'booked', patient_name: 'Test'
    });

    const res = await request(app)
      .get('/api/appointments/1')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointment.id).toBe(1);
  });

  test('returns 404 for non-existent appointment', async () => {
    Appointment.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/appointments/9999')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /api/appointments/:id/status', () => {
  test('doctor can update appointment status', async () => {
    Appointment.updateStatus.mockResolvedValue({ id: 1, status: 'completed' });

    const res = await request(app)
      .patch('/api/appointments/1/status')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe('completed');
  });

  test('patient cannot update appointment status (403)', async () => {
    const res = await request(app)
      .patch('/api/appointments/1/status')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/appointments/:id', () => {
  test('can cancel an appointment', async () => {
    Appointment.cancel.mockResolvedValue({ id: 1, status: 'cancelled' });

    const res = await request(app)
      .delete('/api/appointments/1')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('cancelled');
  });

  test('returns 404 when cancelling non-existent appointment', async () => {
    Appointment.cancel.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/appointments/9999')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/appointments/stats/:doctorId', () => {
  test('doctor can retrieve today stats', async () => {
    Appointment.getTodayStats.mockResolvedValue({
      total: 10, completed: 5, pending: 3, in_progress: 1, cancelled: 1
    });

    const res = await request(app)
      .get('/api/appointments/stats/1')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(10);
  });
});
