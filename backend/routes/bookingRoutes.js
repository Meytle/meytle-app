/**
 * Booking Routes
 */

const express = require('express');
const { 
  createBooking, 
  getBookings, 
  getBookingById,
  updateBookingStatus, 
  updatePaymentStatus,
  getCompanionAvailability, 
  setCompanionAvailability, 
  getAvailableTimeSlots,
  getCompanionBookingsByDateRange
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Booking management
router.post('/create', createBooking);
router.get('/my-bookings', getBookings);

// Availability management (companion only) - static routes first
router.get('/availability/:companionId', getCompanionAvailability);
router.post('/availability', setCompanionAvailability);
router.get('/availability/:companionId/slots', getAvailableTimeSlots);
router.get('/bookings/:companionId/date-range', getCompanionBookingsByDateRange);

// Dynamic bookingId routes - placed after static routes to avoid conflicts
router.get('/:bookingId', getBookingById);
router.put('/:bookingId/status', updateBookingStatus);
router.put('/:bookingId/payment-status', updatePaymentStatus);

module.exports = router;

