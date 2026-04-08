/**
 * Auth Controller
 * Handles user registration, login, OTP verification, and admin operations
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
        const { name, phone, email, role, password, specialization, qualification, clinicAddress, experienceYears, consultationFee } = req.body;

        // Check if user already exists
        const existing = await query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return errorResponse(res, 'User with this phone number already exists', 409);
        }

        // Password is required — reject silently-insecure defaults
        if (!password) {
            return errorResponse(res, 'Password is required', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Doctors start as inactive (pending admin approval)
        const isActive = role === ROLES.DOCTOR ? false : true;

        // Create user
        const result = await query(
            'INSERT INTO users (name, phone, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, email || null, passwordHash, role || ROLES.PATIENT, isActive]
        );

        const userId = result.insertId;

        // Create role-specific profile
        if (role === ROLES.DOCTOR) {
            await query(
                'INSERT INTO doctors (user_id, specialization, qualification, clinic_address, experience_years, consultation_fee) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, specialization || 'General Medicine', qualification || '', clinicAddress || '', experienceYears || 0, consultationFee || 500]
            );

            successResponse(res, {
                message: 'Doctor registration submitted! Your account is pending admin approval.',
                pendingApproval: true,
                user: { id: userId, name, phone, email, role: ROLES.DOCTOR }
            }, 201);
        } else {
            await query('INSERT INTO patients (user_id) VALUES (?)', [userId]);

            const token = generateToken({ id: userId, phone, role: role || ROLES.PATIENT, name });
            successResponse(res, {
                message: 'Registration successful',
                token,
                user: { id: userId, name, phone, email, role: role || ROLES.PATIENT }
            }, 201);
        }
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

        // Check if doctor is approved
        if (user.role === 'doctor' && !user.is_active) {
            return errorResponse(res, 'Your account is pending admin approval. Please wait for approval.', 403);
        }

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

        successResponse(res, {
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
            devCode: process.env.OTP_DEV_MODE === 'true' ? otp : undefined,
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

        const isValid = await verifyOTP(phone, otp);
        if (!isValid) {
            return errorResponse(res, 'Invalid or expired OTP', 401);
        }

        let users = await query('SELECT * FROM users WHERE phone = ?', [phone]);
        if (users.length === 0) {
            return errorResponse(res, 'User not found. Please register first.', 404);
        }

        const user = users[0];

        if (user.role === 'doctor' && !user.is_active) {
            return errorResponse(res, 'Your account is pending admin approval.', 403);
        }

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

// ========================
// ADMIN ENDPOINTS
// ========================

/**
 * Get all users (admin only)
 * GET /api/auth/admin/users
 */
async function getAllUsers(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Admin access required', 403);
        }
        const users = await query('SELECT id, name, phone, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
        successResponse(res, { users });
    } catch (error) {
        errorResponse(res, 'Failed to get users: ' + error.message);
    }
}

/**
 * Get pending doctor approvals (admin only)
 * GET /api/auth/admin/pending-doctors
 */
async function getPendingDoctors(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Admin access required', 403);
        }
        const doctors = await query(
            `SELECT u.id, u.name, u.phone, u.email, u.created_at,
                    d.specialization, d.qualification, d.experience_years, d.consultation_fee
             FROM users u
             JOIN doctors d ON d.user_id = u.id
             WHERE u.role = 'doctor' AND u.is_active = FALSE
             ORDER BY u.created_at DESC`
        );
        successResponse(res, { doctors });
    } catch (error) {
        errorResponse(res, 'Failed to get pending doctors: ' + error.message);
    }
}

/**
 * Approve a doctor (admin only)
 * PUT /api/auth/admin/approve-doctor/:userId
 */
async function approveDoctor(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Admin access required', 403);
        }
        const { userId } = req.params;
        await query('UPDATE users SET is_active = TRUE WHERE id = ? AND role = ?', [userId, 'doctor']);
        successResponse(res, { message: 'Doctor approved successfully' });
    } catch (error) {
        errorResponse(res, 'Failed to approve doctor: ' + error.message);
    }
}

/**
 * Reject/delete a doctor registration (admin only)
 * DELETE /api/auth/admin/reject-doctor/:userId
 */
async function rejectDoctor(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Admin access required', 403);
        }
        const { userId } = req.params;
        await query('DELETE FROM doctors WHERE user_id = ?', [userId]);
        await query('DELETE FROM users WHERE id = ? AND role = ? AND is_active = FALSE', [userId, 'doctor']);
        successResponse(res, { message: 'Doctor registration rejected' });
    } catch (error) {
        errorResponse(res, 'Failed to reject doctor: ' + error.message);
    }
}

/**
 * Get system stats (admin only)
 * GET /api/auth/admin/stats
 */
async function getAdminStats(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return errorResponse(res, 'Admin access required', 403);
        }
        const [patients] = await query('SELECT COUNT(*) as count FROM users WHERE role = "patient"');
        const [doctors] = await query('SELECT COUNT(*) as count FROM users WHERE role = "doctor" AND is_active = TRUE');
        const [pending] = await query('SELECT COUNT(*) as count FROM users WHERE role = "doctor" AND is_active = FALSE');
        const [todayAppts] = await query('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()');
        const [totalAppts] = await query('SELECT COUNT(*) as count FROM appointments');

        successResponse(res, {
            stats: {
                totalPatients: patients.count,
                totalDoctors: doctors.count,
                pendingDoctors: pending.count,
                todayAppointments: todayAppts.count,
                totalAppointments: totalAppts.count
            }
        });
    } catch (error) {
        errorResponse(res, 'Failed to get stats: ' + error.message);
    }
}

module.exports = {
    register, login, sendOTP, verifyOTPAndLogin, getProfile,
    getAllUsers, getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats
};
