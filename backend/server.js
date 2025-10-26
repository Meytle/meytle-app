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

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Meytle Backend Server...\n');

    // Test MySQL server connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('MySQL server connection failed. Make sure MySQL is running.');
    }

    // Initialize database schema (this creates the database if it doesn't exist)
    await initializeDatabase();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`\n✅ Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Authentication:`);
      console.log(`   - POST   /api/auth/signup`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/auth/profile (protected)`);
      console.log(`   Client (protected):`);
      console.log(`   - GET    /api/client/profile`);
      console.log(`   - PUT    /api/client/profile`);
      console.log(`   - POST   /api/client/profile/photo`);
      console.log(`   - POST   /api/client/verify-identity`);
      console.log(`   - GET    /api/client/verification-status`);
      console.log(`   Companion (protected):`);
      console.log(`   - POST   /api/companion/application`);
      console.log(`   - GET    /api/companion/application/status`);
      console.log(`   - POST   /api/companion/profile/photo`);
      console.log(`   Admin (protected):`);
      console.log(`   - GET    /api/admin/dashboard/stats`);
      console.log(`   - GET    /api/admin/applications`);
      console.log(`   - PUT    /api/admin/applications/:id/approve`);
      console.log(`   - PUT    /api/admin/applications/:id/reject`);
      console.log(`   - GET    /api/admin/users`);
      console.log(`   - DELETE /api/admin/users/:id`);
      console.log(`   Service Categories (protected):`);
      console.log(`   - GET    /api/service-categories (list all)`);
      console.log(`   - GET    /api/service-categories/:id (get one)`);
      console.log(`   - POST   /api/service-categories (admin - create)`);
      console.log(`   - PUT    /api/service-categories/:id (admin - update)`);
      console.log(`   - DELETE /api/service-categories/:id (admin - delete)`);
      console.log(`   Stripe (protected):`);
      console.log(`   - POST   /api/stripe/connect/create-account (protected)`);
      console.log(`   - POST   /api/stripe/connect/onboarding-link (protected)`);
      console.log(`   - GET    /api/stripe/connect/account-status (protected)`);
      console.log(`   - POST   /api/stripe/webhook (public)`);
      console.log(`   Health:`);
      console.log(`   - GET    /health\n`);
    });

    return server; // Return server instance for graceful shutdown
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Graceful shutdown handling
let serverInstance = null;

const gracefulShutdown = async (signal) => {
  console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    if (serverInstance) {
      await new Promise((resolve) => {
        serverInstance.close(resolve);
      });
      console.log('✅ Server closed to new connections');
    }

    // Close database pool
    await closePool();
    console.log('✅ Database connections closed');

    console.log('👋 Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
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
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
