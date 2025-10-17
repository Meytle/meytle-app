/**
 * Application constants
 * Centralized constants to avoid magic strings and ensure consistency
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  COMPANION_APPLICATION: '/companion-application',
  CLIENT_DASHBOARD: '/client-dashboard',
  CLIENT_PROFILE: '/client-profile',
  COMPANION_DASHBOARD: '/companion-dashboard',
  COMPANION_PROFILE: '/companion-profile',
  ADMIN_DASHBOARD: '/admin-dashboard',
  PAYMENT_CONFIRMATION: '/payment/confirmation',
  PAYMENT_FAILED: '/payment/failed',
  BROWSE_COMPANIONS: '/browse-companions',
  ABOUT: '/about',
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  SIGN_IN_SUCCESS: 'Successfully signed in!',
  SIGN_OUT_SUCCESS: 'Signed out successfully',
  SIGN_UP_SUCCESS: 'Account created successfully!',
  SIGN_IN_ERROR: 'Failed to sign in. Please check your credentials.',
  SIGN_UP_ERROR: 'Failed to create account. Please try again.',
  UNAUTHORIZED: 'Please sign in to access this page',
  ACCESS_DENIED_CLIENT: 'Access denied. This page is for clients only.',
  ACCESS_DENIED_COMPANION: 'Access denied. This page is for companions only.',
  PASSWORD_MISMATCH: "Passwords don't match!",
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
} as const;

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  COMPANION: 'companion',
  ADMIN: 'admin',
} as const;

// Response Times
export const RESPONSE_TIMES = {
  FAST: '30 minutes',
  MEDIUM: '2 hours',
  SLOW: '24 hours',
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Booking Constants
export const BOOKING_CONSTANTS = {
  SERVICE_FEE_PERCENTAGE: 0.10, // 10% platform service fee
  MIN_BOOKING_HOURS: 1, // minimum booking duration
  MAX_BOOKING_HOURS: 12, // maximum booking duration
} as const;

// Meeting Types
export const MEETING_TYPES = {
  IN_PERSON: 'in_person',
  VIRTUAL: 'virtual',
} as const;

// Booking Steps
export const BOOKING_STEPS = {
  DATE_TIME: 1, // step 1 identifier
  SERVICE_DETAILS: 2, // step 2 identifier  
  REVIEW: 3, // step 3 identifier
  TOTAL_STEPS: 3, // total number of steps
} as const;

