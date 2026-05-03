/**
 * Prescription Routes (UC-06)
 */

const express = require('express');
const router = express.Router();
const {
    getMyPrescriptions,
    getPrescription,
    createPrescription,
} = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/my', getMyPrescriptions);
router.post('/', authorize('doctor', 'admin'), createPrescription);
router.get('/:id', getPrescription);

module.exports = router;
