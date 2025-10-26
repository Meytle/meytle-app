/**
 * Authentication Routes
 */

const express = require('express');
const { signup, login, signout, getProfile, verifyEmail, resendVerification, switchRole, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authRateLimiter, emailVerificationRateLimiter } = require('../middleware/rateLimiting');
const { validateSignup, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes with validation (no IP-based signup restrictions for demo)
router.post('/signup', validateSignup, signup);
router.post('/login', authRateLimiter, validateLogin, login);
router.post('/signout', signout);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.post('/resend-verification', authMiddleware, emailVerificationRateLimiter, resendVerification);
router.post('/switch-role', authMiddleware, switchRole);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;
