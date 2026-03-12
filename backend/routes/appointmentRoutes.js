/**
 * Appointment Routes
 * API endpoints for booking, managing, and querying appointments
 */

const express = require('express');
const router = express.Router();
const {
    bookAppointment, getAppointment, getMyAppointments,
    getDoctorAppointments, updateStatus, cancelAppointment, getStats
} = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Patient routes
router.post('/', bookAppointment);
router.get('/my', getMyAppointments);

// Doctor/Staff routes
router.get('/doctor/:doctorId', authorize('doctor', 'admin', 'staff'), getDoctorAppointments);
router.get('/stats/:doctorId', authorize('doctor', 'admin', 'staff'), getStats);
router.patch('/:id/status', authorize('doctor', 'admin', 'staff'), updateStatus);

// Common routes
router.get('/:id', getAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
