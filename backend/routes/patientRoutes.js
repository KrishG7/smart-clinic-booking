/**
 * Patient Routes
 * API endpoints for patient profile management
 */

const express = require('express');
const router = express.Router();
const { getPatient, getMyProfile, getAllPatients, updatePatient, searchPatients, deletePatient } = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Patient-specific routes
router.get('/me', getMyProfile);
router.get('/search', authorize('admin', 'staff', 'doctor'), searchPatients);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

// Admin/Staff routes
router.get('/', authorize('admin', 'staff', 'doctor'), getAllPatients);

module.exports = router;
