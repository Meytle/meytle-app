/**
 * Application Configuration
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sahil',
    name: process.env.DB_NAME || 'meetgo_db',
    port: process.env.DB_PORT || 3306
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
};
