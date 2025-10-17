/**
 * Authentication Routes
 */

const express = require('express');
const { signup, login, getProfile, verifyEmail, resendVerification, switchRole } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.post('/resend-verification', authMiddleware, resendVerification);
router.post('/switch-role', authMiddleware, switchRole);

module.exports = router;
