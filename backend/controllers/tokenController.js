/**
 * Token Controller
 * Handles live queue management, token progression, and emergency interrupts
 */

const Token = require('../models/Token');
const { query: dbQuery } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get current queue for a doctor (UC-03)
 * GET /api/tokens/queue/:doctorId
 */
async function getQueue(req, res) {
    try {
        const queue = await Token.getQueue(req.params.doctorId);
        const currentToken = await Token.getCurrentToken(req.params.doctorId);

        successResponse(res, {
            doctorId: req.params.doctorId,
            currentToken: currentToken ? {
                tokenNumber: currentToken.token_number,
                patientName: currentToken.patient_name,
                status: currentToken.status
            } : null,
            queueLength: queue.length,
            queue: queue.map(t => ({
                id: t.id,
                tokenNumber: t.token_number,
                patientName: t.patient_name,
                patientPhone: t.patient_phone,
                status: t.status,
                type: t.type,
                queuePosition: t.queue_position,
                estimatedWait: t.estimated_wait_minutes,
                checkInTime: t.check_in_time
            }))
        });
    } catch (error) {
        errorResponse(res, 'Failed to get queue: ' + error.message);
    }
}

/**
 * Call next patient in queue (UC-03: Call Next Token)
 * POST /api/tokens/next
 */
async function callNext(req, res) {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return errorResponse(res, 'Doctor ID is required', 400);
        }

        const nextToken = await Token.callNext(doctorId);

        if (!nextToken) {
            return successResponse(res, {
                message: 'No more patients in the queue',
                nextToken: null
            });
        }

        successResponse(res, {
            message: `Now serving Token #${nextToken.token_number}`,
            nextToken: {
                id: nextToken.id,
                tokenNumber: nextToken.token_number,
                patientName: nextToken.patient_name,
                patientPhone: nextToken.patient_phone,
                status: nextToken.status
            }
        });
    } catch (error) {
        errorResponse(res, 'Failed to call next: ' + error.message);
    }
}

/**
 * Emergency interrupt (UC-04: Emergency Interrupt)
 * POST /api/tokens/emergency
 */
async function emergencyInterrupt(req, res) {
    try {
        const { doctorId, patientId, appointmentId } = req.body;

        if (!doctorId || !patientId) {
            return errorResponse(res, 'Doctor ID and Patient ID are required', 400);
        }

        const emergencyToken = await Token.emergencyInterrupt(doctorId, patientId, appointmentId);

        successResponse(res, {
            message: 'Emergency token issued — placed at top of queue',
            token: emergencyToken
        }, 201);
    } catch (error) {
        errorResponse(res, 'Failed to issue emergency token: ' + error.message);
    }
}

/**
 * Patient check-in via GPS (UC-05: Patient Check-In)
 * POST /api/tokens/:id/checkin
 */
async function checkIn(req, res) {
    try {
        const { latitude, longitude } = req.body;

        // Validate GPS location (geofencing)
        const clinicLat = parseFloat(process.env.CLINIC_LATITUDE) || 28.6139;
        const clinicLng = parseFloat(process.env.CLINIC_LONGITUDE) || 77.2090;
        const radius = parseInt(process.env.GEOFENCE_RADIUS_METERS) || 200;

        if (latitude && longitude) {
            const distance = calculateDistance(latitude, longitude, clinicLat, clinicLng);
            if (distance > radius) {
                return errorResponse(res, `You are ${Math.round(distance)}m away. Please come within ${radius}m of the clinic to check in.`, 403);
            }
        }

        const token = await Token.checkIn(req.params.id);
        if (!token) {
            return errorResponse(res, 'Token not found', 404);
        }

        successResponse(res, {
            message: 'Check-in successful',
            token
        });
    } catch (error) {
        errorResponse(res, 'Check-in failed: ' + error.message);
    }
}

/**
 * Skip a token
 * POST /api/tokens/:id/skip
 */
async function skipToken(req, res) {
    try {
        const token = await Token.skip(req.params.id);
        if (!token) {
            return errorResponse(res, 'Token not found', 404);
        }
        successResponse(res, { message: 'Token skipped', token });
    } catch (error) {
        errorResponse(res, 'Failed to skip token: ' + error.message);
    }
}

/**
 * Get today's stats
 * GET /api/tokens/stats/:doctorId
 */
async function getTokenStats(req, res) {
    try {
        const stats = await Token.getTodayStats(req.params.doctorId);
        successResponse(res, { stats });
    } catch (error) {
        errorResponse(res, 'Failed to get stats: ' + error.message);
    }
}

/**
 * Get patient's tokens for today
 * GET /api/tokens/my
 */
async function getMyTokens(req, res) {
    try {
        const patients = await dbQuery('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);

        if (patients.length === 0) {
            return errorResponse(res, 'Patient profile not found', 404);
        }

        const tokens = await Token.findByPatientToday(patients[0].id);
        successResponse(res, { tokens });
    } catch (error) {
        errorResponse(res, 'Failed to get tokens: ' + error.message);
    }
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    getQueue, callNext, emergencyInterrupt, checkIn,
    skipToken, getTokenStats, getMyTokens
};
