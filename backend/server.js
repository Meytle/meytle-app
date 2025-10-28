/**
 * Main Server File
 * Entry point for the Meytle Backend API
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config/config');
const { testConnection, initializeDatabase, closePool } = require('./config/database');
const logger = require('./services/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Security middlewares
const {
  enforceHTTPS,
  securityHeaders,
  preventParameterPollution,
  securityLogger,
  hideSensitiveInfo
} = require('./middleware/security');

// Rate limiting middlewares
const {
  apiRateLimiter,
  authRateLimiter,
  searchRateLimiter,
  emailVerificationRateLimiter
} = require('./middleware/rateLimiting');

// Validation middleware
const { sanitizeInput } = require('./middleware/validation');

// Routes
const authRoutes = require('./routes/authRoutes');
const companionRoutes = require('./routes/companionRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Apply security middlewares first
app.use(enforceHTTPS);
app.use(securityHeaders);
app.use(preventParameterPollution);

// CORS configuration
app.use(cors({
  ...config.cors,
  credentials: true // Allow cookies to be sent with requests
}));

// Body parsing middlewares
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global security middlewares
app.use(sanitizeInput); // Sanitize all inputs to prevent XSS
app.use(securityLogger); // Log security events
app.use(hideSensitiveInfo); // Hide sensitive info from responses

// Note: Rate limiting is now applied selectively on specific routes
// instead of globally to avoid blocking legitimate dashboard requests

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true
}));

// Request logging middleware
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler - use centralized handler
app.use(notFoundHandler);

// Global error handler - use centralized handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    logger.info('Starting Meytle Backend Server...');

    // Test MySQL server connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('MySQL server connection failed. Make sure MySQL is running.');
    }

    // Initialize database schema (this creates the database if it doesn't exist)
    await initializeDatabase();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
      logger.info('API Endpoints available:');
      logger.info('  Authentication:');
      logger.info('  - POST   /api/auth/signup');
      logger.info('  - POST   /api/auth/login');
      logger.info('  - GET    /api/auth/profile (protected)');
      logger.info('  Client (protected):');
      logger.info('  - GET    /api/client/profile');
      logger.info('  - PUT    /api/client/profile');
      logger.info('  - POST   /api/client/profile/photo');
      logger.info('  - POST   /api/client/verify-identity');
      logger.info('  - GET    /api/client/verification-status');
      logger.info('  Companion (protected):');
      logger.info('  - POST   /api/companion/application');
      logger.info('  - GET    /api/companion/application/status');
      logger.info('  - POST   /api/companion/profile/photo');
      logger.info('  Admin (protected):');
      logger.info('  - GET    /api/admin/dashboard/stats');
      logger.info('  - GET    /api/admin/applications');
      logger.info('  - PUT    /api/admin/applications/:id/approve');
      logger.info('  - PUT    /api/admin/applications/:id/reject');
      logger.info('  - GET    /api/admin/users');
      logger.info('  - DELETE /api/admin/users/:id');
      logger.info('  Service Categories (protected):');
      logger.info('  - GET    /api/service-categories (list all)');
      logger.info('  - GET    /api/service-categories/:id (get one)');
      logger.info('  - POST   /api/service-categories (admin - create)');
      logger.info('  - PUT    /api/service-categories/:id (admin - update)');
      logger.info('  - DELETE /api/service-categories/:id (admin - delete)');
      logger.info('  Stripe (protected):');
      logger.info('  - POST   /api/stripe/connect/create-account (protected)');
      logger.info('  - POST   /api/stripe/connect/onboarding-link (protected)');
      logger.info('  - GET    /api/stripe/connect/account-status (protected)');
      logger.info('  - POST   /api/stripe/webhook (public)');
      logger.info('  Health:');
      logger.info('  - GET    /health');
    });

    return server; // Return server instance for graceful shutdown
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Graceful shutdown handling
let serverInstance = null;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    if (serverInstance) {
      await new Promise((resolve) => {
        serverInstance.close(resolve);
      });
      logger.info('Server closed to new connections');
    }

    // Close database pool
    await closePool();
    logger.info('Database connections closed');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server and capture the instance
startServer().then((server) => {
  serverInstance = server;
}).catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});

module.exports = app;
