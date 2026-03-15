/**
 * Authentication Configuration
 * JWT settings and token generation/verification utilities
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} Signed JWT token
 */
function generateToken(payload) {
    return jwt.sign(
        {
            id: payload.id,
            phone: payload.phone,
            role: payload.role,
            name: payload.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Role definitions for the system
 */
const ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    STAFF: 'staff',
    ADMIN: 'admin'
};

/**
 * Token status definitions
 */
const TOKEN_STATUS = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
    CANCELLED: 'cancelled',
    EMERGENCY: 'emergency'
};

/**
 * Sync status definitions
 */
const SYNC_STATUS = {
    SYNCED: 'synced',
    PENDING: 'pending',
    CONFLICT: 'conflict',
    FAILED: 'failed'
};

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    generateToken,
    verifyToken,
    ROLES,
    TOKEN_STATUS,
    SYNC_STATUS
};
