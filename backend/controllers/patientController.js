/**
 * Patient Controller
 * Handles patient profile management operations
 */

const Patient = require('../models/Patient');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get patient profile
 * GET /api/patients/:id
 */
async function getPatient(req, res) {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        // SECURITY FIX #3: Only the owning patient (matched by user_id) or
        // privileged roles (admin, staff, doctor) may read a patient profile.
        const isPrivileged = ['admin', 'staff', 'doctor'].includes(req.user.role);
        if (!isPrivileged && patient.user_id !== req.user.id) {
            return errorResponse(res, 'Access denied', 403);
        }

        successResponse(res, { patient });
    } catch (error) {
        errorResponse(res, 'Failed to get patient: ' + error.message);
    }
}

/**
 * Get patient by user ID (for logged in patient)
 * GET /api/patients/me
 */
async function getMyProfile(req, res) {
    try {
        const patient = await Patient.findByUserId(req.user.id);
        if (!patient) {
            return errorResponse(res, 'Patient profile not found', 404);
        }
        successResponse(res, { patient });
    } catch (error) {
        errorResponse(res, 'Failed to get profile: ' + error.message);
    }
}

/**
 * Get all patients (admin/staff only)
 * GET /api/patients
 */
async function getAllPatients(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await Patient.findAll(page, limit);
        successResponse(res, result);
    } catch (error) {
        errorResponse(res, 'Failed to get patients: ' + error.message);
    }
}

/**
 * Update patient profile
 * PUT /api/patients/:id
 */
async function updatePatient(req, res) {
    try {
        // SECURITY FIX #3: Only the owning patient or an admin may update a patient profile.
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }
        const isPrivileged = ['admin'].includes(req.user.role);
        if (!isPrivileged && patient.user_id !== req.user.id) {
            return errorResponse(res, 'Access denied', 403);
        }
        const updated = await Patient.update(req.params.id, req.body);
        if (!updated) {
            return errorResponse(res, 'No fields to update or patient not found', 400);
        }
        successResponse(res, { message: 'Profile updated', patient: updated });
    } catch (error) {
        errorResponse(res, 'Failed to update patient: ' + error.message);
    }
}

/**
 * Search patients
 * GET /api/patients/search?q=term
 */
async function searchPatients(req, res) {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) {
            return errorResponse(res, 'Search term is required', 400);
        }
        const patients = await Patient.search(searchTerm);
        successResponse(res, { patients });
    } catch (error) {
        errorResponse(res, 'Search failed: ' + error.message);
    }
}

/**
 * Delete patient
 * DELETE /api/patients/:id
 */
async function deletePatient(req, res) {
    try {
        const deleted = await Patient.delete(req.params.id);
        if (!deleted) {
            return errorResponse(res, 'Patient not found', 404);
        }
        successResponse(res, { message: 'Patient deleted successfully' });
    } catch (error) {
        errorResponse(res, 'Failed to delete patient: ' + error.message);
    }
}

module.exports = { getPatient, getMyProfile, getAllPatients, updatePatient, searchPatients, deletePatient };
