/**
 * Companion Routes
 */

const express = require('express');
const { submitApplication, getApplicationStatus, updateProfilePhoto, getApprovedCompanions, saveInterests, getCompanionInterests } = require('../controllers/companionController');
const authMiddleware = require('../middleware/auth');
const { uploadCompanionFiles, uploadProfilePhoto } = require('../config/multer');

const router = express.Router();

// Get all approved companions (public endpoint - no auth required)
router.get('/browse', getApprovedCompanions);

// All routes below require authentication
router.use(authMiddleware);

// Submit companion application (with file uploads)
router.post('/application', uploadCompanionFiles, submitApplication);

// Get application status
router.get('/application/status', getApplicationStatus);

// Update profile photo
router.post('/profile/photo', uploadProfilePhoto, updateProfilePhoto);

// Interests management
router.post('/interests', saveInterests);
router.get('/interests/:companionId', getCompanionInterests);

module.exports = router;
