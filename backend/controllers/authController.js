/**
 * Authentication Controller
 * Handles user signup and login
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config/config');
const { sendWelcomeEmail, sendVerificationEmail, generateVerificationToken } = require('../services/emailService');

/**
 * Sign up a new user
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    // Validate required fields
    if (!name || !email || !password || !roles) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: name, email, password, and roles'
      });
    }

    // Validate roles (support both single role and array of roles)
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const validRoles = ['client', 'companion', 'admin'];
    
    for (const role of roleArray) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`
        });
      }
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Use the first role as the primary role for backward compatibility
    const primaryRole = roleArray[0];

    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, primaryRole, verificationToken, verificationExpires]
    );

    const userId = result.insertId;

    // Insert roles into user_roles table
    for (const role of roleArray) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role, is_active) VALUES (?, ?, TRUE)',
        [userId, role]
      );
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, primaryRole);
      console.log('✅ Welcome email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail signup if email fails
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
      console.log('✅ Verification email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail signup if email fails
    }

    // Generate JWT token with roles array
    const token = jwt.sign(
      { id: userId, email, roles: roleArray, activeRole: primaryRole },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user data (excluding password)
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: userId,
          name,
          email,
          roles: roleArray,
          activeRole: primaryRole,
          emailVerified: false
        }
      },
      message: 'Account created successfully! Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create account. Please try again.',
      error: error.message
    });
  }
};

/**
 * Sign in an existing user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user by email with their roles
    const [users] = await pool.query(
      'SELECT id, name, email, password, role, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Get all active roles for the user
    const [userRoles] = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = ? AND is_active = TRUE',
      [user.id]
    );

    const roles = userRoles.map(role => role.role);
    const activeRole = user.role; // Use primary role as default active role

    // Generate JWT token with roles array
    const token = jwt.sign(
      { id: user.id, email: user.email, roles, activeRole },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user data (excluding password)
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles,
          activeRole,
          emailVerified: user.email_verified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sign in. Please try again.',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get all active roles for the user
    const [userRoles] = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    const roles = userRoles.map(role => role.role);
    const user = users[0];

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user,
          roles,
          activeRole: user.role
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Verify email address
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    // Find user by verification token
    const [users] = await pool.query(
      'SELECT id, name, email, email_verification_expires FROM users WHERE email_verification_token = ? AND email_verified = FALSE',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date() > new Date(user.email_verification_expires)) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token has expired'
      });
    }

    // Update user as verified
    await pool.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: true
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.query(
      'SELECT id, name, email, email_verified FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];

    if (user.email_verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await pool.query(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?',
      [verificationToken, verificationExpires, userId]
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email resent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully!'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};

/**
 * Switch user's active role
 */
const switchRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Role is required'
      });
    }

    // Check if user has this role
    const [userRoles] = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = ? AND role = ? AND is_active = TRUE',
      [userId, role]
    );

    if (userRoles.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to switch to this role'
      });
    }

    // Update user's primary role in users table
    await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    // Get all user roles for new token
    const [allUserRoles] = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    const roles = allUserRoles.map(r => r.role);

    // Generate new JWT token with updated active role
    const token = jwt.sign(
      { id: userId, email: req.user.email, roles, activeRole: role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: userId,
          activeRole: role,
          roles
        }
      },
      message: `Successfully switched to ${role} role`
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to switch role',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  verifyEmail,
  resendVerification,
  switchRole
};
