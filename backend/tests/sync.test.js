/**
 * Sync Controller Tests
 * Tests push sync, pull sync, and sync status endpoints
 */

const request = require('supertest');
const app = require('../app');
const { generateToken } = require('../config/auth');

jest.mock('../config/database', () => {
  const mockPool = { end: jest.fn() };
  return {
    pool: mockPool,
    connectDB: jest.fn().mockResolvedValue(mockPool),
    query: jest.fn(),
    transaction: jest.fn(),
  };
});

const { query, transaction } = require('../config/database');
const { pool } = require('../config/database');

const patientToken = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test Patient' });

afterAll(async () => { pool.end(); });
beforeEach(() => {
  jest.clearAllMocks();
  // Drain any leftover .mockResolvedValueOnce queues that jest.clearAllMocks
  // doesn't touch — that was the source of mock-leak between tests.
  query.mockReset();
  transaction.mockReset();
  // Appointment model methods are stubbed inline per-test (see below);
  // no module-level jest.mock for it, so don't try to reset it here.
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/sync/push', () => {
  test('syncs a new appointment (creates on server)', async () => {
    const Appointment = require('../models/Appointment');
    const origFind = Appointment.findByLocalId;
    const origCreate = Appointment.create;

    Appointment.findByLocalId = jest.fn().mockResolvedValue(null); // doesn't exist
    Appointment.create = jest.fn().mockResolvedValue({ id: 100, tokenNo: 5 });
    query.mockResolvedValueOnce([{ id: 5 }]).mockResolvedValueOnce({ insertId: 1 }); // patient lookup, sync_log insert

    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        deviceId: 'device-001',
        appointments: [{
          localId: 'local-uuid-001',
          patientId: 1,
          doctorId: 1,
          appointmentDate: '2025-06-15',
          appointmentTime: '10:00:00',
          type: 'regular',
          updatedAt: new Date().toISOString()
        }]
      });

    expect(res.status).toBe(200);
    expect(res.body.summary.synced).toBe(1);
    expect(res.body.summary.errors).toBe(0);
    expect(res.body.results.synced[0].action).toBe('created');

    Appointment.findByLocalId = origFind;
    Appointment.create = origCreate;
  });

  test('resolves conflict with Last Write Wins (local is newer)', async () => {
    const Appointment = require('../models/Appointment');
    const origFind = Appointment.findByLocalId;
    const origUpdate = Appointment.updateStatus;
    const origUpdateSync = Appointment.updateSyncStatus;

    const serverTime = new Date('2025-06-01T08:00:00Z');
    const clientTime = new Date('2025-06-01T10:00:00Z'); // newer

    Appointment.findByLocalId = jest.fn().mockResolvedValue({
      id: 50, updated_at: serverTime.toISOString(), status: 'booked', patient_id: 5
    });
    Appointment.updateStatus = jest.fn().mockResolvedValue({ id: 50, status: 'completed' });
    Appointment.updateSyncStatus = jest.fn().mockResolvedValue();
    query.mockResolvedValueOnce([{ id: 5 }]).mockResolvedValueOnce({ insertId: 1 }); // patient lookup, sync_log

    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        deviceId: 'device-001',
        appointments: [{
          localId: 'local-uuid-002',
          status: 'completed',
          updatedAt: clientTime.toISOString()
        }]
      });

    expect(res.status).toBe(200);
    expect(res.body.summary.synced).toBe(1);
    expect(res.body.results.synced[0].action).toBe('updated');

    Appointment.findByLocalId = origFind;
    Appointment.updateStatus = origUpdate;
    Appointment.updateSyncStatus = origUpdateSync;
  });

  test('detects conflict when server data is newer (server wins)', async () => {
    const Appointment = require('../models/Appointment');
    const origFind = Appointment.findByLocalId;

    const serverTime = new Date('2025-06-01T12:00:00Z');
    const clientTime = new Date('2025-06-01T08:00:00Z'); // older

    Appointment.findByLocalId = jest.fn().mockResolvedValue({
      id: 60, updated_at: serverTime.toISOString(), status: 'completed', patient_id: 5
    });
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup

    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        deviceId: 'device-001',
        appointments: [{
          localId: 'local-uuid-003',
          status: 'booked',
          updatedAt: clientTime.toISOString()
        }]
      });

    expect(res.status).toBe(200);
    expect(res.body.summary.conflicts).toBe(1);
    expect(res.body.results.conflicts[0].action).toBe('conflict');

    Appointment.findByLocalId = origFind;
  });

  test('handles empty appointments array', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // patient lookup
    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ appointments: [], deviceId: 'device-001' });

    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(0);
    expect(res.body.summary.synced).toBe(0);
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/sync/push').send({ appointments: [] });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/sync/pull', () => {
  test('pulls data for the authenticated user', async () => {
    query
      .mockResolvedValueOnce([{ id: 1, appointment_date: '2025-06-01', status: 'booked' }]) // appointments
      .mockResolvedValueOnce([]); // prescriptions

    const res = await request(app)
      .get('/api/sync/pull')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.appointments).toHaveLength(1);
    expect(res.body.data.prescriptions).toHaveLength(0);
    expect(res.body.timestamp).toBeDefined();
  });

  test('supports since filter for incremental sync', async () => {
    query
      .mockResolvedValueOnce([]) // appointments
      .mockResolvedValueOnce([]); // prescriptions

    const res = await request(app)
      .get('/api/sync/pull?since=2025-06-01T00:00:00Z')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/sync/pull');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/sync/status', () => {
  test('returns sync status overview', async () => {
    query
      .mockResolvedValueOnce([{ id: 5 }]) // patient lookup
      .mockResolvedValueOnce([{ id: 1, table_name: 'appointments', operation: 'insert', sync_status: 'synced', created_at: new Date() }]) // logs
      .mockResolvedValueOnce([{ count: 3 }]); // pending count

    const res = await request(app)
      .get('/api/sync/status')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pendingRecords).toBe(3);
    expect(res.body.recentLogs).toHaveLength(1);
  });
});
