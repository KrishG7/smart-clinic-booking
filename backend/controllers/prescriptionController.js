/**
 * Prescription Controller (UC-06: Digital Prescription)
 * Doctors create prescriptions tied to a completed/in-progress appointment.
 * Patients can view their own prescriptions on the web dashboard and mobile app.
 *
 * Ownership rules (defense in depth — repeated in every read endpoint):
 * - Patients see only rows where prescriptions.patient_id == their patients.id
 * - Doctors see/create only for appointments that belong to them
 * - Admin/staff see everything
 */

const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Convert the JSON column to an array no matter what shape MySQL returns.
function _normalizeMedications(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
}

function _shape(row) {
    return {
        id: row.id,
        appointmentId: row.appointment_id,
        doctorId: row.doctor_id,
        patientId: row.patient_id,
        diagnosis: row.diagnosis || '',
        medications: _normalizeMedications(row.medications),
        instructions: row.instructions || '',
        followUpDate: row.follow_up_date,
        createdAt: row.created_at,
        // Optional joined fields (when caller asked for them)
        doctorName: row.doctor_name,
        specialization: row.specialization,
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
    };
}

/**
 * GET /api/prescriptions/my
 * Returns every prescription belonging to the logged-in patient.
 */
async function getMyPrescriptions(req, res) {
    try {
        const patientRows = await query(
            'SELECT id FROM patients WHERE user_id = ?',
            [req.user.id]
        );
        if (patientRows.length === 0) {
            return errorResponse(res, 'Patient profile not found', 404);
        }
        const patientId = patientRows[0].id;

        const rows = await query(
            `SELECT p.*, u.name AS doctor_name, d.specialization,
                    a.appointment_date, a.appointment_time
             FROM prescriptions p
             LEFT JOIN doctors d ON d.id = p.doctor_id
             LEFT JOIN users u ON u.id = d.user_id
             LEFT JOIN appointments a ON a.id = p.appointment_id
             WHERE p.patient_id = ?
             ORDER BY p.created_at DESC`,
            [patientId]
        );

        successResponse(res, { prescriptions: rows.map(_shape) });
    } catch (err) {
        console.error('getMyPrescriptions error:', err);
        errorResponse(res, 'Failed to fetch prescriptions');
    }
}

/**
 * GET /api/prescriptions/:id
 * Single prescription, ownership-checked.
 */
async function getPrescription(req, res) {
    try {
        const rows = await query(
            `SELECT p.*, u.name AS doctor_name, d.specialization,
                    a.appointment_date, a.appointment_time
             FROM prescriptions p
             LEFT JOIN doctors d ON d.id = p.doctor_id
             LEFT JOIN users u ON u.id = d.user_id
             LEFT JOIN appointments a ON a.id = p.appointment_id
             WHERE p.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return errorResponse(res, 'Prescription not found', 404);
        }
        const rx = rows[0];

        const role = req.user.role;
        if (role === 'patient') {
            const own = await query(
                'SELECT id FROM patients WHERE user_id = ?',
                [req.user.id]
            );
            if (own[0]?.id !== rx.patient_id) {
                return errorResponse(res, 'Access denied', 403);
            }
        } else if (role === 'doctor') {
            const own = await query(
                'SELECT id FROM doctors WHERE user_id = ?',
                [req.user.id]
            );
            if (own[0]?.id !== rx.doctor_id) {
                return errorResponse(res, 'Access denied', 403);
            }
        } else if (!['admin', 'staff'].includes(role)) {
            return errorResponse(res, 'Access denied', 403);
        }

        successResponse(res, { prescription: _shape(rx) });
    } catch (err) {
        console.error('getPrescription error:', err);
        errorResponse(res, 'Failed to fetch prescription');
    }
}

/**
 * POST /api/prescriptions
 * Doctor creates a prescription for one of their appointments.
 * Body: { appointmentId, diagnosis, medications:[{name,dose,frequency}], instructions, followUpDate }
 */
async function createPrescription(req, res) {
    try {
        const {
            appointmentId,
            diagnosis = '',
            medications = [],
            instructions = '',
            followUpDate = null,
        } = req.body;

        if (!appointmentId) {
            return errorResponse(res, 'appointmentId is required', 400);
        }
        if (!Array.isArray(medications)) {
            return errorResponse(res, 'medications must be an array', 400);
        }

        // Resolve the doctor row for the caller
        const doctorRows = await query(
            'SELECT id FROM doctors WHERE user_id = ?',
            [req.user.id]
        );
        const doctorId = doctorRows[0]?.id;
        if (!doctorId) {
            return errorResponse(res, 'Doctor profile not found', 404);
        }

        // Confirm the appointment exists AND belongs to this doctor
        const apptRows = await query(
            'SELECT id, doctor_id, patient_id FROM appointments WHERE id = ?',
            [appointmentId]
        );
        if (apptRows.length === 0) {
            return errorResponse(res, 'Appointment not found', 404);
        }
        const appt = apptRows[0];
        if (appt.doctor_id !== doctorId) {
            return errorResponse(
                res,
                'Access denied: you can only prescribe for your own appointments',
                403
            );
        }

        const result = await query(
            `INSERT INTO prescriptions
             (appointment_id, doctor_id, patient_id, diagnosis, medications, instructions, follow_up_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                appt.id,
                doctorId,
                appt.patient_id,
                diagnosis,
                JSON.stringify(medications),
                instructions,
                followUpDate,
            ]
        );

        successResponse(
            res,
            {
                message: 'Prescription created',
                prescription: {
                    id: result.insertId,
                    appointmentId: appt.id,
                    doctorId,
                    patientId: appt.patient_id,
                    diagnosis,
                    medications,
                    instructions,
                    followUpDate,
                },
            },
            201
        );
    } catch (err) {
        console.error('createPrescription error:', err);
        errorResponse(res, 'Failed to create prescription');
    }
}

module.exports = { getMyPrescriptions, getPrescription, createPrescription };
