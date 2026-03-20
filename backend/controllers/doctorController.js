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
        const patientCount = await Doctor.getTodayPatientCount(req.params.id);
        const doctor = await Doctor.findById(req.params.id);

        successResponse(res, {
            doctorId: req.params.id,
            todayPatients: patientCount,
            maxPatients: doctor ? doctor.max_patients_per_day : 0,
            slotsRemaining: doctor ? doctor.max_patients_per_day - patientCount : 0
        });
    } catch (error) {
        errorResponse(res, 'Failed to get stats: ' + error.message);
    }
}

module.exports = { getDoctor, getAllDoctors, getSpecializations, updateDoctor, getAvailableSlots, getDoctorStats };
