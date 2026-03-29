/**
 * Appointment Controller
 * Handles appointment booking, retrieval, and management
 * Supports offline booking (UC-01)
 */

const Appointment = require('../models/Appointment');
const Token = require('../models/Token');
const { successResponse, errorResponse } = require('../utils/helpers');
const { query: dbQuery, transaction } = require('../config/database');

/**
 * Book a new appointment (UC-01: Offline-capable booking)
 * POST /api/appointments
 */
async function bookAppointment(req, res) {
    try {
        const { doctorId, appointmentDate, appointmentTime, type, reason, localId } = req.body;

        // Validate required fields before any DB access
        if (!doctorId || !appointmentDate || !appointmentTime) {
            return errorResponse(res, 'doctorId, appointmentDate, and appointmentTime are required', 400);
        }

        // Get patient ID from the logged-in user
        const patients = await dbQuery('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);

        if (patients.length === 0) {
            return errorResponse(res, 'Patient profile not found', 404);
        }

        const patientId = patients[0].id;

        // Validate appointment date is not in the past
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const apptDate = new Date(appointmentDate);
        if (apptDate < today) {
            return errorResponse(res, 'Appointment date must be today or in the future', 400);
        }

        // Check for duplicate local_id (prevent re-sync of same appointment)
        if (localId) {
            const existing = await Appointment.findByLocalId(localId);
            if (existing) {
                return successResponse(res, {
                    message: 'Appointment already synced',
                    appointment: existing
                });
            }
        }

        // ── ATOMIC: Create appointment + token in a single transaction ───────
        // If either insert fails, both are rolled back — no orphaned appointments.
        const { appointment, token } = await transaction(async (conn) => {
            // 1. Lock and determine next token_no for appointment
            const [apptRows] = await conn.execute(
                `SELECT COALESCE(MAX(token_no), 0) + 1 AS nextNum
                 FROM appointments
                 WHERE doctor_id = ? AND appointment_date = ? FOR UPDATE`,
                [doctorId, appointmentDate]
            );
            const tokenNo = apptRows[0].nextNum;

            // 2. Insert appointment
            const apptResult = await conn.execute(
                `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time,
                 token_no, type, reason, sync_status, local_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [patientId, doctorId, appointmentDate, appointmentTime,
                 tokenNo, type || 'regular', reason || null, 'synced', localId || null]
            );
            const appointmentId = apptResult[0].insertId;

            // 2. Determine next token number with a locking read (no race condition)
            const [tokenRows] = await conn.execute(
                `SELECT COALESCE(MAX(token_number), 0) + 1 AS nextNum
                 FROM tokens
                 WHERE doctor_id = ? AND token_date = CURDATE() FOR UPDATE`,
                [doctorId]
            );
            const tokenNumber = tokenRows[0].nextNum;

            const [posRows] = await conn.execute(
                `SELECT COUNT(*) + 1 AS position FROM tokens
                 WHERE doctor_id = ? AND token_date = CURDATE()
                 AND status IN ('waiting', 'in_progress')`,
                [doctorId]
            );
            const queuePosition = posRows[0].position;
            const estimatedWait = (queuePosition - 1) * 15;

            // 3. Insert token
            const [tokenResult] = await conn.execute(
                `INSERT INTO tokens (appointment_id, doctor_id, patient_id, token_number,
                 token_date, type, estimated_wait_minutes, queue_position)
                 VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
                [appointmentId, doctorId, patientId, tokenNumber,
                 type || 'regular', estimatedWait, queuePosition]
            );

            return {
                appointment: { id: appointmentId, patientId, doctorId, appointmentDate, appointmentTime },
                token: { id: tokenResult.insertId, tokenNumber, queuePosition, estimatedWait }
            };
        });

        successResponse(res, {
            message: 'Appointment booked successfully',
            appointment,
            token: {
                tokenNumber: token.tokenNumber,
                queuePosition: token.queuePosition,
                estimatedWait: token.estimatedWait
            }
        }, 201);
    } catch (error) {
        console.error('Booking error:', error);
        errorResponse(res, 'Failed to book appointment: ' + error.message);
    }
}

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
async function getAppointment(req, res) {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }
        successResponse(res, { appointment });
    } catch (error) {
        errorResponse(res, 'Failed to get appointment: ' + error.message);
    }
}

/**
 * Get appointments for the logged-in patient
 * GET /api/appointments/my
 */
async function getMyAppointments(req, res) {
    try {
        const patients = await dbQuery('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);

        if (patients.length === 0) {
            return errorResponse(res, 'Patient profile not found', 404);
        }

        const appointments = await Appointment.findByPatient(patients[0].id, req.query.status);
        successResponse(res, { appointments });
    } catch (error) {
        errorResponse(res, 'Failed to get appointments: ' + error.message);
    }
}

/**
 * Get appointments for a doctor on a date
 * GET /api/appointments/doctor/:doctorId?date=2025-03-15
 */
async function getDoctorAppointments(req, res) {
    try {
        const appointments = await Appointment.findByDoctor(
            req.params.doctorId,
            req.query.date || new Date().toISOString().split('T')[0]
        );
        successResponse(res, { appointments });
    } catch (error) {
        errorResponse(res, 'Failed to get appointments: ' + error.message);
    }
}

/**
 * Update appointment status
 * PATCH /api/appointments/:id/status
 */
async function updateStatus(req, res) {
    try {
        const { status, notes } = req.body;
        const appointment = await Appointment.updateStatus(req.params.id, status, notes);
        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }
        successResponse(res, { message: 'Status updated', appointment });
    } catch (error) {
        errorResponse(res, 'Failed to update status: ' + error.message);
    }
}

/**
 * Cancel an appointment
 * DELETE /api/appointments/:id
 */
async function cancelAppointment(req, res) {
    try {
        const appointment = await Appointment.cancel(req.params.id);
        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }
        successResponse(res, { message: 'Appointment cancelled', appointment });
    } catch (error) {
        errorResponse(res, 'Failed to cancel appointment: ' + error.message);
    }
}

/**
 * Get today's stats for a doctor
 * GET /api/appointments/stats/:doctorId
 */
async function getStats(req, res) {
    try {
        const stats = await Appointment.getTodayStats(req.params.doctorId);
        successResponse(res, { stats });
    } catch (error) {
        errorResponse(res, 'Failed to get stats: ' + error.message);
    }
}

module.exports = {
    bookAppointment, getAppointment, getMyAppointments,
    getDoctorAppointments, updateStatus, cancelAppointment, getStats
};
