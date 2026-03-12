/**
 * Helper Utilities
 * Common helper functions used across the application
 */

/**
 * Send a standardized success response
 */
function successResponse(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        ...data
    });
}

/**
 * Send a standardized error response
 */
function errorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message
    });
}

/**
 * Format a date to YYYY-MM-DD
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Format time to HH:MM
 */
function formatTime(timeStr) {
    const parts = String(timeStr).split(':');
    return `${parts[0]}:${parts[1]}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getToday() {
    return formatDate(new Date());
}

/**
 * Calculate the difference in minutes between two timestamps
 */
function minutesDiff(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime - startTime) / (1000 * 60));
}

/**
 * Generate a random string of specified length
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
    return /^[0-9]{10,15}$/.test(phone);
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

module.exports = {
    successResponse,
    errorResponse,
    formatDate,
    formatTime,
    getToday,
    minutesDiff,
    generateRandomString,
    isValidPhone,
    sanitize
};
