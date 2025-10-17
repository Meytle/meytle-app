/**
 * Main Server File
 * Entry point for the MeetGo Backend API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const { testConnection, initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const companionRoutes = require('./routes/companionRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.log('🚀 Starting MeetGo Backend Server...\n');

    // Test MySQL server connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('MySQL server connection failed. Make sure MySQL is running.');
    }

    // Initialize database schema (this creates the database if it doesn't exist)
    await initializeDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`\n✅ Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.cors.origin}`);
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
      console.log(`   Health:`);
      console.log(`   - GET    /health\n`);
    });
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

// Start the server
startServer();

module.exports = app;
