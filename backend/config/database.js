/**
 * Database Configuration and Connection
 */

const mysql = require('mysql2');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sahil',
  database: process.env.DB_NAME || 'meetgo_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based pool
const promisePool = pool.promise();

// Test database connection (without selecting a database)
const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    await connection.promise().query('SELECT 1');
    console.log('✅ MySQL Server connected successfully');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    await connection.end();

    // Create users table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('client', 'companion', 'admin') NOT NULL DEFAULT 'client',
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        email_verification_token VARCHAR(255) NULL,
        email_verification_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_email_verified (email_verified),
        INDEX idx_verification_token (email_verification_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table ready');

    // Ensure users table has email verification columns and indexes (for existing databases)
    try {
      // Check and add columns conditionally without IF NOT EXISTS (for older MySQL versions)
      const dbName = dbConfig.database;

      const [[{ count_verified }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_verified FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified'`,
        [dbName]
      );
      if (Number(count_verified) === 0) {
        await promisePool.query(
          `ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE`
        );
      }

      const [[{ count_token }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_token FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_token'`,
        [dbName]
      );
      if (Number(count_token) === 0) {
        await promisePool.query(
          `ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL`
        );
      }

      const [[{ count_expires }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_expires FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_expires'`,
        [dbName]
      );
      if (Number(count_expires) === 0) {
        await promisePool.query(
          `ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP NULL`
        );
      }

      // Check and add indexes conditionally
      const [[{ idx_verified }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_verified FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_email_verified'`,
        [dbName]
      );
      if (Number(idx_verified) === 0) {
        await promisePool.query(
          `ALTER TABLE users ADD INDEX idx_email_verified (email_verified)`
        );
      }

      const [[{ idx_token }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_token FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_verification_token'`,
        [dbName]
      );
      if (Number(idx_token) === 0) {
        await promisePool.query(
          `ALTER TABLE users ADD INDEX idx_verification_token (email_verification_token)`
        );
      }
    } catch (migrationError) {
      console.error('❌ Users table migration failed:', migrationError.message);
    }

    // Create companion_applications table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS companion_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        profile_photo_url VARCHAR(500),
        government_id_url VARCHAR(500),
        date_of_birth DATE NOT NULL,
        government_id_number VARCHAR(100) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Companion applications table ready');

    // Create client_verifications table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS client_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        profile_photo_url VARCHAR(500),
        id_document_url VARCHAR(500),
        date_of_birth DATE,
        government_id_number VARCHAR(100),
        phone_number VARCHAR(50),
        location VARCHAR(255),
        bio TEXT,
        verification_status ENUM('not_submitted', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'not_submitted',
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_verification_status (verification_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Client verifications table ready');

    // Create companion_availability table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS companion_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        companion_id INT NOT NULL,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (companion_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_companion_id (companion_id),
        INDEX idx_day_of_week (day_of_week),
        UNIQUE KEY unique_companion_day_time (companion_id, day_of_week, start_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Companion availability table ready');

    // Create service_categories table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Service categories table ready');

    // Drop redundant idx_name index if it exists (migration for existing databases)
    try {
      const dbName = dbConfig.database;
      const [[{ idx_name_exists }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_name_exists FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'service_categories' AND INDEX_NAME = 'idx_name'`,
        [dbName]
      );
      if (Number(idx_name_exists) > 0) {
        await promisePool.query(
          `ALTER TABLE service_categories DROP INDEX idx_name`
        );
        console.log('✅ Dropped redundant idx_name index from service_categories');
      }
    } catch (migrationError) {
      console.error('❌ Drop idx_name migration failed:', migrationError.message);
    }

    // Create bookings table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        companion_id INT NOT NULL,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration_hours DECIMAL(3,1) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
        special_requests TEXT,
        meeting_location VARCHAR(255),
        meeting_type ENUM('in_person', 'virtual') NULL DEFAULT 'in_person',
        payment_status ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'unpaid',
        payment_method VARCHAR(50) NULL,
        payment_intent_id VARCHAR(255) NULL,
        paid_at TIMESTAMP NULL,
        service_category_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (companion_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
        INDEX idx_client_id (client_id),
        INDEX idx_companion_id (companion_id),
        INDEX idx_booking_date (booking_date),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_service_category_id (service_category_id),
        INDEX idx_payment_status (payment_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bookings table ready');

    // Add service_category_id column to existing bookings table (migration)
    try {
      const dbName = dbConfig.database;

      const [[{ count_category_id }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_category_id FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'service_category_id'`,
        [dbName]
      );
      if (Number(count_category_id) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN service_category_id INT NULL`
        );
      }

      // Add foreign key constraint
      const [[{ count_fk }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_fk FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND CONSTRAINT_NAME = 'fk_bookings_service_category'`,
        [dbName]
      );
      if (Number(count_fk) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings 
           ADD CONSTRAINT fk_bookings_service_category 
           FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE SET NULL`
        );
      }

      // Add index on service_category_id
      const [[{ idx_category }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_category FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_service_category_id'`,
        [dbName]
      );
      if (Number(idx_category) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD INDEX idx_service_category_id (service_category_id)`
        );
      }
    } catch (migrationError) {
      console.error('❌ Bookings service_category_id migration failed:', migrationError.message);
    }

    // Add meeting_type column to existing bookings table (migration)
    try {
      const dbName = dbConfig.database;

      const [[{ count_meeting_type }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_meeting_type FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'meeting_type'`,
        [dbName]
      );
      if (Number(count_meeting_type) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN meeting_type ENUM('in_person', 'virtual') NULL DEFAULT 'in_person'`
        );
      }

      // Add index on meeting_type
      const [[{ idx_meeting_type }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_meeting_type FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_meeting_type'`,
        [dbName]
      );
      if (Number(idx_meeting_type) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD INDEX idx_meeting_type (meeting_type)`
        );
      }
    } catch (migrationError) {
      console.error('❌ Bookings meeting_type migration failed:', migrationError.message);
    }

    // Add payment-related columns to existing bookings table (migration)
    try {
      const dbName = dbConfig.database;

      // Add payment_status column
      const [[{ count_payment_status }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_payment_status FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_status'`,
        [dbName]
      );
      if (Number(count_payment_status) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'unpaid'`
        );
      }

      // Add payment_method column
      const [[{ count_payment_method }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_payment_method FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_method'`,
        [dbName]
      );
      if (Number(count_payment_method) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50) NULL`
        );
      }

      // Add payment_intent_id column
      const [[{ count_payment_intent_id }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_payment_intent_id FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_intent_id'`,
        [dbName]
      );
      if (Number(count_payment_intent_id) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255) NULL`
        );
      }

      // Add paid_at column
      const [[{ count_paid_at }]] = await promisePool.query(
        `SELECT COUNT(*) AS count_paid_at FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'paid_at'`,
        [dbName]
      );
      if (Number(count_paid_at) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD COLUMN paid_at TIMESTAMP NULL`
        );
      }

      // Add index on payment_status
      const [[{ idx_payment_status }]] = await promisePool.query(
        `SELECT COUNT(*) AS idx_payment_status FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND INDEX_NAME = 'idx_payment_status'`,
        [dbName]
      );
      if (Number(idx_payment_status) === 0) {
        await promisePool.query(
          `ALTER TABLE bookings ADD INDEX idx_payment_status (payment_status)`
        );
      }
    } catch (migrationError) {
      console.error('❌ Bookings payment fields migration failed:', migrationError.message);
    }

    // Create booking_reviews table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS booking_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        reviewee_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_booking_reviewer (booking_id, reviewer_id),
        INDEX idx_booking_id (booking_id),
        INDEX idx_reviewee_id (reviewee_id),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Booking reviews table ready');

    // Create user_roles table for dual role support
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role ENUM('client', 'companion', 'admin') NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active),
        UNIQUE KEY unique_user_role (user_id, role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ User roles table ready');

    // Create companion_interests table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS companion_interests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        companion_id INT NOT NULL,
        interest_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (companion_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_companion_id (companion_id),
        INDEX idx_interest_name (interest_name),
        UNIQUE KEY unique_companion_interest (companion_id, interest_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Companion interests table ready');

    // Migrate existing users to user_roles table
    try {
      const [existingUsers] = await promisePool.query(`
        SELECT id, role FROM users WHERE role IS NOT NULL
      `);
      
      for (const user of existingUsers) {
        // Check if user already has entries in user_roles
        const [existingRoles] = await promisePool.query(`
          SELECT COUNT(*) as count FROM user_roles WHERE user_id = ?
        `, [user.id]);
        
        if (existingRoles[0].count === 0) {
          // Create user_roles entry for existing user
          await promisePool.query(`
            INSERT INTO user_roles (user_id, role, is_active) VALUES (?, ?, TRUE)
          `, [user.id, user.role]);
        }
      }
      console.log('✅ Migrated existing users to user_roles table');
    } catch (migrationError) {
      console.error('❌ User roles migration failed:', migrationError.message);
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  testConnection,
  initializeDatabase
};
