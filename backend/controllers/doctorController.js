/**
 * Doctor Controller
 * Handles doctor profile, schedule, and availability management
 */

const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get doctor profile
 * GET /api/doctors/:id
 */
async function getDoctor(req, res) {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }
        successResponse(res, { doctor });
    } catch (error) {
        errorResponse(res, 'Failed to get doctor: ' + error.message);
    }
}

/**
 * Get all doctors with optional specialization filter
 * GET /api/doctors?specialization=General Medicine
 */
async function getAllDoctors(req, res) {
    try {
        const filters = {};
        if (req.query.specialization) {
            filters.specialization = req.query.specialization;
        }
        const doctors = await Doctor.findAll(filters);
        successResponse(res, { doctors });
    } catch (error) {
        errorResponse(res, 'Failed to get doctors: ' + error.message);
    }
}

/**
 * Get all specializations
 * GET /api/doctors/specializations
 */
async function getSpecializations(req, res) {
    try {
        const specializations = await Doctor.getSpecializations();
        successResponse(res, { specializations });
    } catch (error) {
        errorResponse(res, 'Failed to get specializations: ' + error.message);
    }
}

/**
 * Update doctor profile
 * PUT /api/doctors/:id
 */
async function updateDoctor(req, res) {
    try {
        // Only the doctor themselves or an admin can update a profile
        if (req.user.role !== 'admin') {
            const { query: dbQuery } = require('../config/database');
            const [doctorRow] = await dbQuery(
                'SELECT id FROM doctors WHERE user_id = ? AND id = ?',
                [req.user.id, req.params.id]
            );
            if (!doctorRow) {
                return errorResponse(res, 'Forbidden: you can only edit your own profile', 403);
            }
        }
        const doctor = await Doctor.update(req.params.id, req.body);
        if (!doctor) {
            return errorResponse(res, 'No fields to update or doctor not found', 400);
        }
        successResponse(res, { message: 'Profile updated', doctor });
    } catch (error) {
        errorResponse(res, 'Failed to update doctor: ' + error.message);
    }
}

/**
 * Get available time slots for a doctor
 * GET /api/doctors/:id/slots?date=2025-03-15
 */
async function getAvailableSlots(req, res) {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return errorResponse(res, 'Date parameter is required', 400);
        }

        const slots = await Doctor.getAvailableSlots(id, date);
        successResponse(res, { doctorId: id, date, slots });
    } catch (error) {
        errorResponse(res, 'Failed to get slots: ' + error.message);
    }
}

/**
 * Get doctor's today stats
 * GET /api/doctors/:id/stats
 */
async function getDoctorStats(req, res) {
    try {
        // Single query — avoids two round-trips and handles unknown IDs correctly
        const { query: dbQuery } = require('../config/database');
        const rows = await dbQuery(
            `SELECT d.max_patients_per_day,
                    COUNT(a.id) AS today_patients
             FROM doctors d
             LEFT JOIN appointments a
               ON a.doctor_id = d.id
               AND a.appointment_date = CURDATE()
               AND a.status != 'cancelled'
             WHERE d.id = ?
             GROUP BY d.id, d.max_patients_per_day`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        const { max_patients_per_day, today_patients } = rows[0];
        successResponse(res, {
            doctorId: req.params.id,
            todayPatients: today_patients,
            maxPatients: max_patients_per_day,
            slotsRemaining: max_patients_per_day - today_patients
        });
    } catch (error) {
        errorResponse(res, 'Failed to get stats: ' + error.message);
    }
}

module.exports = { getDoctor, getAllDoctors, getSpecializations, updateDoctor, getAvailableSlots, getDoctorStats };
