/**
 * Auth Routes
 * Endpoints for user authentication, registration, OTP flows, and admin operations
 */

const express = require('express');
const router = express.Router();
const {
    register, login, sendOTP, verifyOTPAndLogin, getProfile,
    getAllUsers, getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats,
    adminCreateUser
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin, validateOTP } = require('../middleware/validator');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', validateOTP, verifyOTPAndLogin);

// Protected routes
router.get('/me', authenticate, getProfile);

// Admin routes (auth middleware + role check inside controller)
router.get('/admin/users', authenticate, getAllUsers);
router.get('/admin/pending-doctors', authenticate, getPendingDoctors);
router.get('/admin/stats', authenticate, getAdminStats);
router.put('/admin/approve-doctor/:userId', authenticate, approveDoctor);
router.delete('/admin/reject-doctor/:userId', authenticate, rejectDoctor);
// Admin-only: create any role (doctor, staff, admin)
router.post('/admin/create-user', authenticate, adminCreateUser);

module.exports = router;
