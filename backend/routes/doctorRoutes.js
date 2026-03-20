/**
 * Doctor Routes
 * API endpoints for doctor profile, schedule, and availability
 */

const express = require('express');
const router = express.Router();
const { getDoctor, getAllDoctors, getSpecializations, updateDoctor, getAvailableSlots, getDoctorStats } = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public routes (patients can view doctors)
router.get('/specializations', getSpecializations);
router.get('/', getAllDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getAvailableSlots);

// Protected routes
router.get('/:id/stats', authenticate, authorize('doctor', 'admin', 'staff'), getDoctorStats);
router.put('/:id', authenticate, authorize('doctor', 'admin'), updateDoctor);

module.exports = router;
