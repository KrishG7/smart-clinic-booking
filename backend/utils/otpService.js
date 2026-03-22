/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 * For demo/development: accepts '123456' as a universal OTP
 */

const { query } = require('../config/database');

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS) || 300; // 5 minutes

/**
 * Generate and store a new OTP for a phone number
 * @param {string} phone - Phone number
 * @param {string} purpose - Purpose: 'login', 'register', 'reset'
 * @returns {string} The generated OTP code
 */
async function generateOTP(phone, purpose = 'login') {
    // Generate random OTP
    const otp = generateRandomOTP(OTP_LENGTH);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);

    // Invalidate any existing OTPs for this phone
    await query(
        'UPDATE otps SET is_verified = TRUE WHERE phone = ? AND is_verified = FALSE',
        [phone]
    );

    // Store new OTP
    await query(
        'INSERT INTO otps (phone, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)',
        [phone, otp, purpose, expiresAt]
    );

    console.log(`📱 OTP for ${phone}: ${otp} (expires in ${OTP_EXPIRY}s)`);

    return otp;
}

/**
 * Verify an OTP code for a phone number
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code to verify
 * @returns {boolean} Whether the OTP is valid
 */
async function verifyOTP(phone, otp) {
    // Demo mode: accept '123456' as universal OTP
    if (otp === '123456' && process.env.NODE_ENV !== 'production') {
        return true;
    }

    // Check database for valid OTP
    const results = await query(
        `SELECT id FROM otps
     WHERE phone = ? AND otp_code = ? AND is_verified = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
        [phone, otp]
    );

    if (results.length === 0) {
        return false;
    }

    // Mark OTP as verified
    await query(
        'UPDATE otps SET is_verified = TRUE WHERE id = ?',
        [results[0].id]
    );

    return true;
}

/**
 * Generate a random numeric OTP of specified length
 */
function generateRandomOTP(length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

/**
 * Clean up expired OTPs (can be called periodically)
 */
async function cleanupExpiredOTPs() {
    const result = await query(
        'DELETE FROM otps WHERE expires_at < NOW() OR is_verified = TRUE'
    );
    return result.affectedRows;
}

module.exports = { generateOTP, verifyOTP, cleanupExpiredOTPs };
