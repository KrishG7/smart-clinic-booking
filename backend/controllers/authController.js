/**
 * Auth Controller
 * Handles user registration, login, and OTP verification
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken, ROLES } = require('../config/auth');
const { generateOTP, verifyOTP } = require('../utils/otpService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { name, phone, email, role, password } = req.body;

        // Check if user already exists
        const existing = await query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return errorResponse(res, 'User with this phone number already exists', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password || 'default123', 10);

        // Create user
        const result = await query(
            'INSERT INTO users (name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name, phone, email, passwordHash, role || ROLES.PATIENT]
        );

        const userId = result.insertId;

        // Create role-specific profile
        if (role === ROLES.DOCTOR) {
            await query(
                'INSERT INTO doctors (user_id, specialization) VALUES (?, ?)',
                [userId, req.body.specialization || 'General Medicine']
            );
        } else {
            await query(
                'INSERT INTO patients (user_id) VALUES (?)',
                [userId]
            );
        }

        // Generate JWT token
        const token = generateToken({ id: userId, phone, role: role || ROLES.PATIENT, name });

        successResponse(res, {
            message: 'Registration successful',
            token,
            user: { id: userId, name, phone, email, role: role || ROLES.PATIENT }
        }, 201);
    } catch (error) {
        console.error('Registration error:', error);
        errorResponse(res, 'Registration failed: ' + error.message);
    }
}

/**
 * Login with phone and password
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { phone, password } = req.body;

        // Find user
        const users = await query('SELECT * FROM users WHERE phone = ?', [phone]);
        if (users.length === 0) {
            return errorResponse(res, 'User not found', 404);
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            phone: user.phone,
            role: user.role,
            name: user.name
        });

        successResponse(res, {
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        errorResponse(res, 'Login failed: ' + error.message);
    }
}

/**
 * Send OTP for verification
 * POST /api/auth/send-otp
 */
async function sendOTP(req, res) {
    try {
        const { phone, purpose } = req.body;

        const otp = await generateOTP(phone, purpose || 'login');

        // In production, send OTP via SMS service
        // For demo, we return it in the response
        successResponse(res, {
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
            expiresIn: process.env.OTP_EXPIRY_SECONDS || 300
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        errorResponse(res, 'Failed to send OTP: ' + error.message);
    }
}

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 */
async function verifyOTPAndLogin(req, res) {
    try {
        const { phone, otp } = req.body;

        // Verify OTP
        const isValid = await verifyOTP(phone, otp);
        if (!isValid) {
            return errorResponse(res, 'Invalid or expired OTP', 401);
        }

        // Find or create user
        let users = await query('SELECT * FROM users WHERE phone = ?', [phone]);

        if (users.length === 0) {
            return errorResponse(res, 'User not found. Please register first.', 404);
        }

        const user = users[0];
        const token = generateToken({
            id: user.id,
            phone: user.phone,
            role: user.role,
            name: user.name
        });

        successResponse(res, {
            message: 'OTP verified successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        errorResponse(res, 'OTP verification failed: ' + error.message);
    }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getProfile(req, res) {
    try {
        const users = await query('SELECT id, name, phone, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return errorResponse(res, 'User not found', 404);
        }
        successResponse(res, { user: users[0] });
    } catch (error) {
        errorResponse(res, 'Failed to get profile: ' + error.message);
    }
}

module.exports = { register, login, sendOTP, verifyOTPAndLogin, getProfile };
