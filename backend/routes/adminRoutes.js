/**
 * Admin Routes
 * Protected routes for admin operations
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getApplications,
  approveApplication,
  rejectApplication,
  getUsers,
  deleteUser
} = require('../controllers/adminController');

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminAuth);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Application management
router.get('/applications', getApplications);
router.put('/applications/:applicationId/approve', approveApplication);
router.put('/applications/:applicationId/reject', rejectApplication);

// User management
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);

module.exports = router;






















