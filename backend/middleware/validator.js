/**
 * Request Validator Middleware
 * Input validation for API endpoints using express-validator
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg
            }))
        });
    }
    next();
}

/**
 * Validate user registration input
 */
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10,15}$/).withMessage('Phone must be 10-15 digits'),
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['patient', 'doctor']).withMessage('Invalid role'),
    // Note: 'role' field is intentionally NOT validated here.
    // Public registration always creates a 'patient' account regardless of what is sent.
    handleValidation
];

/**
 * Validate login input
 */
const validateLogin = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidation
];

/**
 * Validate OTP input
 */
const validateOTP = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidation
];

/**
 * Validate appointment booking input
 */
const validateAppointment = [
    body('doctorId')
        .notEmpty().withMessage('Doctor ID is required')
        .isInt().withMessage('Doctor ID must be a number'),
    body('appointmentDate')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('appointmentTime')
        .notEmpty().withMessage('Time is required'),
    handleValidation
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateOTP,
    validateAppointment,
    handleValidation
};
