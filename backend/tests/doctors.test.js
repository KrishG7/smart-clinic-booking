/**
 * Doctor Controller Tests
 * Tests doctor listing, profile, slots, stats, and update operations
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

const { query } = require('../config/database');
const { pool } = require('../config/database');

const patientToken = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test Patient' });
const doctorToken  = generateToken({ id: 2, phone: '9876543211', role: 'doctor',  name: 'Dr Smith'     });
const adminToken   = generateToken({ id: 3, phone: '9876543212', role: 'admin',   name: 'Admin User'   });

afterAll(async () => { pool.end(); });
beforeEach(() => { jest.clearAllMocks(); });

const mockDoctorData = {
  id: 1, user_id: 2, name: 'Dr Smith', phone: '9876543211', email: 'drsmith@example.com',
  specialization: 'Cardiology', qualification: 'MBBS', experience_years: 10,
  consultation_fee: 500, max_patients_per_day: 30, is_available: true,
  slot_start_time: '09:00:00', slot_end_time: '17:00:00', slot_duration_minutes: 15
};

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/doctors', () => {
  test('returns list of active doctors (public route)', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.findAll;
    Doctor.findAll = jest.fn().mockResolvedValue([mockDoctorData]);

    const res = await request(app).get('/api/doctors');

    expect(res.status).toBe(200);
    expect(res.body.doctors).toHaveLength(1);
    expect(res.body.doctors[0].specialization).toBe('Cardiology');

    Doctor.findAll = orig;
  });

  test('filters by specialization', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.findAll;
    Doctor.findAll = jest.fn().mockResolvedValue([mockDoctorData]);

    const res = await request(app).get('/api/doctors?specialization=Cardiology');

    expect(res.status).toBe(200);
    expect(Doctor.findAll).toHaveBeenCalledWith({ specialization: 'Cardiology' });

    Doctor.findAll = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/doctors/specializations', () => {
  test('returns list of specializations (public)', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.getSpecializations;
    Doctor.getSpecializations = jest.fn().mockResolvedValue(['Cardiology', 'Neurology', 'General Medicine']);

    const res = await request(app).get('/api/doctors/specializations');

    expect(res.status).toBe(200);
    expect(res.body.specializations).toContain('Cardiology');

    Doctor.getSpecializations = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/doctors/:id', () => {
  test('returns doctor by ID (public)', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.findById;
    Doctor.findById = jest.fn().mockResolvedValue(mockDoctorData);

    const res = await request(app).get('/api/doctors/1');

    expect(res.status).toBe(200);
    expect(res.body.doctor.name).toBe('Dr Smith');

    Doctor.findById = orig;
  });

  test('returns 404 for non-existent doctor', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.findById;
    Doctor.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get('/api/doctors/9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    Doctor.findById = orig;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/doctors/:id/slots', () => {
  test('returns available time slots for a doctor (public)', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.getAvailableSlots;
    Doctor.getAvailableSlots = jest.fn().mockResolvedValue([
      { time: '09:00:00', available: true },
      { time: '09:15:00', available: false },
      { time: '09:30:00', available: true },
    ]);

    const res = await request(app).get('/api/doctors/1/slots?date=2025-06-15');

    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(3);
    expect(res.body.slots[0].available).toBe(true);

    Doctor.getAvailableSlots = orig;
  });

  test('returns 400 when date is missing', async () => {
    const res = await request(app).get('/api/doctors/1/slots');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Date parameter is required');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/doctors/:id/stats', () => {
  test('doctor can get their stats', async () => {
    query.mockResolvedValueOnce([
      { max_patients_per_day: 30, today_patients: 12 }
    ]);

    const res = await request(app)
      .get('/api/doctors/1/stats')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todayPatients).toBe(12);
    expect(res.body.slotsRemaining).toBe(18);
  });

  test('returns 404 if doctor not found', async () => {
    query.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/doctors/9999/stats')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(404);
  });

  test('patient cannot get stats (403)', async () => {
    const res = await request(app)
      .get('/api/doctors/1/stats')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('PUT /api/doctors/:id', () => {
  test('admin can update any doctor profile', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.update;
    Doctor.update = jest.fn().mockResolvedValue({ ...mockDoctorData, consultation_fee: 800 });

    const res = await request(app)
      .put('/api/doctors/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ consultationFee: 800 });

    expect(res.status).toBe(200);
    expect(res.body.doctor.consultation_fee).toBe(800);

    Doctor.update = orig;
  });

  test('returns 400 when no fields to update', async () => {
    const Doctor = require('../models/Doctor');
    const orig = Doctor.update;
    Doctor.update = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .put('/api/doctors/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('No fields');

    Doctor.update = orig;
  });
});
