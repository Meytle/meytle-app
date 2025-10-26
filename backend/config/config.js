/**
 * Application Configuration
 *
 * IMPORTANT: All sensitive configuration must be provided via environment variables.
 * No hardcoded secrets or credentials are allowed in this file.
 */

require('dotenv').config();

// Validate environment variables on startup
const { validateEnvironment } = require('../utils/validateEnv');

// Only validate in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment(true); // Exit on error
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Build allowed origins for CORS
const getAllowedOrigins = () => {
  const origins = [];

  // Always allow the configured frontend URL if provided
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  // In development, also allow common localhost ports
  if (isDevelopment) {
    origins.push(
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // Vite alternate
      'http://localhost:3000', // Create React App default
      'http://localhost:3001'  // Common alternate
    );
  }

  return origins;
};

module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration is in database.js to avoid duplication

  // JWT Configuration
  jwt: {
    // No default secret - must be provided via environment variable
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // CORS Configuration
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = getAllowedOrigins();

      // In development, allow requests with no origin (Postman, same-origin)
      // In production, be more restrictive
      if (!origin) {
        if (isDevelopment) {
          return callback(null, true);
        } else {
          // In production, only allow no-origin for same-origin requests
          // This is safer but may block some legitimate tools
          return callback(null, false);
        }
      }

      // Check if the origin is in our allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log rejected origins for debugging
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    // Additional CORS headers for security
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
  },

  // Stripe Configuration
  stripe: {
    // No defaults - all must be provided via environment variables
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    platformAccountId: process.env.STRIPE_PLATFORM_ACCOUNT_ID,
    currency: process.env.CURRENCY || 'usd'
  }
};
