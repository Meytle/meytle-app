/**
 * Backend constants
 * Centralized constants for the backend application
 */

// Booking Constants
const BOOKING_CONSTANTS = {
  SERVICE_FEE_PERCENTAGE: 0.10, // 10% platform service fee
  MIN_BOOKING_HOURS: 1, // minimum booking duration
  MAX_BOOKING_HOURS: 12, // maximum booking duration
};

// Payment Constants
const PAYMENT_CONSTANTS = {
  VALID_STATUSES: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
  DEFAULT_STATUS: 'unpaid',
  VALID_METHODS: ['stripe', 'card', 'cash', 'bank_transfer'],
};

module.exports = {
  BOOKING_CONSTANTS,
  PAYMENT_CONSTANTS,
};
