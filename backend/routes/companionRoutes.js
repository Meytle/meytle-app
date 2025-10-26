/**
 * Companion Routes
 */

const express = require('express');
const { submitApplication, getApplicationStatus, updateProfilePhoto, updateProfile, getApprovedCompanions, saveInterests, getCompanionInterests, getCompanionServices } = require('../controllers/companionController');
const authMiddleware = require('../middleware/auth');
const { uploadCompanionFiles, uploadProfilePhoto } = require('../config/multer');
const { searchRateLimiter } = require('../middleware/rateLimiting');

const router = express.Router();

// Get all approved companions (public endpoint - no auth required)
// Apply rate limiting to prevent scraping
router.get('/browse', searchRateLimiter, getApprovedCompanions);

// All routes below require authentication
router.use(authMiddleware);

// Submit companion application (with file uploads)
router.post('/application', uploadCompanionFiles, submitApplication);

// Get application status
router.get('/application/status', getApplicationStatus);

// Update profile photo
router.post('/profile/photo', uploadProfilePhoto, updateProfilePhoto);

// Update profile data (phone, bio, services, languages, hourly rate)
router.put('/profile', updateProfile);

// Interests management
router.post('/interests', saveInterests);
router.get('/interests/:companionId', getCompanionInterests);

// Get companion's registered services
router.get('/services', getCompanionServices);

module.exports = router;
