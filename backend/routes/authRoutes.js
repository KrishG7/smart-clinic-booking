/**
 * Auth Routes
 * Endpoints for user authentication, registration, and OTP flows
 */

const express = require('express');
const router = express.Router();
const { register, login, sendOTP, verifyOTPAndLogin, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin, validateOTP } = require('../middleware/validator');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', validateOTP, verifyOTPAndLogin);

// Protected routes
router.get('/me', authenticate, getProfile);

module.exports = router;
