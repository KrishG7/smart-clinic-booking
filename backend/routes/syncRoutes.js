/**
 * Sync Routes
 * API endpoints for offline-to-online data synchronization
 */

const express = require('express');
const router = express.Router();
const { pushSync, pullSync, getSyncStatus } = require('../controllers/syncController');
const { authenticate } = require('../middleware/authMiddleware');

// All sync routes require authentication
router.use(authenticate);

// Push local data to server
router.post('/push', pushSync);

// Pull server data to local device
router.get('/pull', pullSync);

// Get sync status and history
router.get('/status', getSyncStatus);

module.exports = router;
