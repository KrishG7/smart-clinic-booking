/**
 * Token Routes
 * API endpoints for live queue token management
 */

const express = require('express');
const router = express.Router();
const {
    getQueue, callNext, emergencyInterrupt,
    checkIn, skipToken, getTokenStats, getMyTokens
} = require('../controllers/tokenController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Patient routes
router.get('/my', getMyTokens);
router.post('/:id/checkin', checkIn);

// Doctor/Staff routes
router.get('/queue/:doctorId', getQueue);
router.post('/next', authorize('doctor', 'admin', 'staff'), callNext);
router.post('/emergency', authorize('doctor', 'admin', 'staff'), emergencyInterrupt);
router.post('/:id/skip', authorize('doctor', 'admin', 'staff'), skipToken);
router.get('/stats/:doctorId', authorize('doctor', 'admin', 'staff'), getTokenStats);

module.exports = router;
