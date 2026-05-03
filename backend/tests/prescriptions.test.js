const request = require('supertest');
const app = require('../app');
const { query } = require('../config/database');
const { generateToken } = require('../config/auth');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool: { end: jest.fn() }
}));

const patientToken = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test Patient' });
const doctorToken = generateToken({ id: 2, phone: '9876543211', role: 'doctor', name: 'Dr. Test' });

beforeEach(() => {
  jest.clearAllMocks();
  query.mockReset();
});

describe('Prescriptions API', () => {
  describe('GET /api/prescriptions/my', () => {
    test('returns prescriptions for a patient', async () => {
      // Patient lookup
      query.mockResolvedValueOnce([{ id: 10 }]);
      // Prescriptions lookup
      query.mockResolvedValueOnce([
        { id: 1, appointment_id: 100, doctor_id: 20, patient_id: 10, diagnosis: 'Fever', medications: '[]', created_at: new Date() }
      ]);

      const res = await request(app)
        .get('/api/prescriptions/my')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.prescriptions).toHaveLength(1);
    });

    test('returns 404 if patient profile not found', async () => {
      query.mockResolvedValueOnce([]); // no patient
      const res = await request(app)
        .get('/api/prescriptions/my')
        .set('Authorization', `Bearer ${patientToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/prescriptions', () => {
    test('doctor can create a prescription for their appointment', async () => {
      // Doctor lookup
      query.mockResolvedValueOnce([{ id: 20 }]);
      // Appointment lookup
      query.mockResolvedValueOnce([{ id: 100, doctor_id: 20, patient_id: 10 }]);
      // Insert
      query.mockResolvedValueOnce({ insertId: 5 });

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: 100,
          diagnosis: 'Cough',
          medications: [{ name: 'Syrup', dose: '10ml', frequency: 'twice a day' }]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.prescription.diagnosis).toBe('Cough');
      expect(res.body.prescription.medications).toHaveLength(1);
    });

    test('rejects creation if appointment belongs to another doctor', async () => {
      // Doctor lookup
      query.mockResolvedValueOnce([{ id: 20 }]);
      // Appointment lookup (different doctor_id)
      query.mockResolvedValueOnce([{ id: 100, doctor_id: 99, patient_id: 10 }]);

      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ appointmentId: 100 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/prescriptions/:id', () => {
    test('patient can view their own prescription', async () => {
      // Prescription lookup
      query.mockResolvedValueOnce([
        { id: 1, appointment_id: 100, doctor_id: 20, patient_id: 10, medications: '[]' }
      ]);
      // Ownership lookup
      query.mockResolvedValueOnce([{ id: 10 }]);

      const res = await request(app)
        .get('/api/prescriptions/1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.prescription.id).toBe(1);
    });

    test('patient cannot view another patient prescription', async () => {
      // Prescription lookup
      query.mockResolvedValueOnce([
        { id: 1, appointment_id: 100, doctor_id: 20, patient_id: 99, medications: '[]' }
      ]);
      // Ownership lookup (current patient is 10, but prescription belongs to 99)
      query.mockResolvedValueOnce([{ id: 10 }]);

      const res = await request(app)
        .get('/api/prescriptions/1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });
  });
});
