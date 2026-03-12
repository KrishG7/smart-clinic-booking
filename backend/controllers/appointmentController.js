/**
 * Appointment Controller
 * Handles appointment booking, retrieval, and management
 * Supports offline booking (UC-01)
 */

const Appointment = require('../models/Appointment');
const Token = require('../models/Token');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Book a new appointment (UC-01: Offline-capable booking)
 * POST /api/appointments
 */
async function bookAppointment(req, res) {
    try {
        const { doctorId, appointmentDate, appointmentTime, type, reason, localId } = req.body;

        // Get patient ID from the logged-in user
        const { query: dbQuery } = require('../config/database');
        const patients = await dbQuery('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);

        if (patients.length === 0) {
            return errorResponse(res, 'Patient profile not found', 404);
        }

        const patientId = patients[0].id;

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

        // Create appointment
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            type: type || 'regular',
            reason,
            syncStatus: localId ? 'synced' : 'synced',
            localId
        });

        // Generate token for the queue
        const token = await Token.create({
            appointmentId: appointment.id,
            doctorId,
            patientId,
            type: type || 'regular'
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
        const { query: dbQuery } = require('../config/database');
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
