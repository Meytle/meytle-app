/**
 * Booking Routes
 */

const express = require('express');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  // Payment functions removed - will be implemented later
  getCompanionAvailability,
  setCompanionAvailability,
  getAvailableTimeSlots,
  getCompanionBookingsByDateRange,
  createReview,
  getCompanionReviews,
  getBookingReview,
  getCompanionWeeklyAvailability,
  getCompanionAvailabilityForDateRange,
  createBookingRequest,
  getBookingRequests,
  updateBookingRequestStatus,
  getBookingRequestById,
  approveBooking,
  rejectBooking,
  getPendingBookingsForCompanion
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');
const { isCompanion, validateCompanionOwnership, companionRateLimit } = require('../middleware/companionAuth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Booking management
router.post('/create', createBooking);
router.get('/my-bookings', getBookings);

// Availability management (companion only) - static routes first
// Public endpoints for viewing availability
router.get('/availability/:companionId', getCompanionAvailability);
router.get('/availability/:companionId/weekly', getCompanionWeeklyAvailability);
router.get('/availability/:companionId/calendar', getCompanionAvailabilityForDateRange);
router.get('/availability/:companionId/slots', getAvailableTimeSlots);
router.get('/bookings/:companionId/date-range', getCompanionBookingsByDateRange);

// Protected companion-only endpoint for setting availability
// Apply rate limiting, companion validation, and ownership check
router.post('/availability',
  companionRateLimit,  // Rate limit to prevent abuse
  isCompanion,  // Ensure user is a companion
  validateCompanionOwnership,  // Ensure they can only modify their own data
  setCompanionAvailability
);

// Review routes (public)
router.get('/companion/:companionId/reviews', getCompanionReviews);

// Booking Request routes
router.post('/requests/create', createBookingRequest);
router.get('/requests', getBookingRequests);
router.get('/requests/:requestId', getBookingRequestById);
router.put('/requests/:requestId/status', isCompanion, updateBookingRequestStatus);

// Companion approval routes
router.get('/companion/pending', isCompanion, getPendingBookingsForCompanion);
router.put('/companion/approve/:bookingId', isCompanion, approveBooking);
router.put('/companion/reject/:bookingId', isCompanion, rejectBooking);

// Dynamic bookingId routes - placed after static routes to avoid conflicts
router.get('/:bookingId', getBookingById);
// Payment routes removed - will be implemented later
router.put('/:bookingId/status', updateBookingStatus);

// Review routes (require booking ownership)
router.post('/:bookingId/review', createReview);
router.get('/:bookingId/review', getBookingReview);

module.exports = router;

