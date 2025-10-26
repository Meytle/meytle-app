/**
 * Client Controller
 * Handles client-specific operations like profile management and identity verification
 */

const { pool: db } = require('../config/database');
const path = require('path');

/**
 * Get client profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for client verification data
    const [verifications] = await db.execute(
      `SELECT
        id,
        profile_photo_url,
        id_document_url,
        date_of_birth,
        government_id_number,
        phone_number,
        location,
        address_line,
        city,
        state,
        country,
        postal_code,
        bio,
        verification_status,
        rejection_reason,
        verified_at,
        reviewed_at,
        created_at
      FROM client_verifications
      WHERE user_id = ?`,
      [userId]
    );

    const verification = verifications[0] || null;

    res.json({
      success: true,
      data: {
        user: users[0],
        verification
      }
    });

  } catch (error) {
    console.error('❌ Error fetching client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update client profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phoneNumber,
      location,
      addressLine,
      city,
      state,
      country,
      postalCode,
      bio
    } = req.body;

    // Update user name
    if (fullName) {
      await db.execute(
        'UPDATE users SET name = ? WHERE id = ?',
        [fullName, userId]
      );
    }

    // Check if verification record exists
    const [existing] = await db.execute(
      'SELECT id FROM client_verifications WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        `UPDATE client_verifications
        SET phone_number = ?,
            location = ?,
            address_line = ?,
            city = ?,
            state = ?,
            country = ?,
            postal_code = ?,
            bio = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [phoneNumber, location, addressLine, city, state, country, postalCode, bio, userId]
      );
    } else {
      // Create new record
      await db.execute(
        `INSERT INTO client_verifications (
          user_id,
          phone_number,
          location,
          address_line,
          city,
          state,
          country,
          postal_code,
          bio
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, phoneNumber, location, addressLine, city, state, country, postalCode, bio]
      );
    }

    // Build full location string from address components
    const locationComponents = [addressLine, city, state, country, postalCode]
      .filter(Boolean)
      .join(', ');

    // Update the location field with the full address
    if (locationComponents) {
      await db.execute(
        'UPDATE client_verifications SET location = ? WHERE user_id = ?',
        [locationComponents, userId]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update profile photo
 */
const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file uploaded'
      });
    }

    const photoPath = `/uploads/profiles/${req.file.filename}`;

    // Check if verification record exists
    const [existing] = await db.execute(
      'SELECT id FROM client_verifications WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        'UPDATE client_verifications SET profile_photo_url = ? WHERE user_id = ?',
        [photoPath, userId]
      );
    } else {
      // Create new record
      await db.execute(
        'INSERT INTO client_verifications (user_id, profile_photo_url) VALUES (?, ?)',
        [userId, photoPath]
      );
    }

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: { photoUrl: photoPath }
    });

  } catch (error) {
    console.error('❌ Error updating profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Submit identity verification
 */
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateOfBirth, governmentIdNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No ID document uploaded'
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required'
      });
    }

    if (!governmentIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Government ID number is required'
      });
    }

    // Check if user has provided address information
    const [verificationCheck] = await db.execute(
      'SELECT address_line, city, state, country, postal_code FROM client_verifications WHERE user_id = ?',
      [userId]
    );

    if (verificationCheck.length === 0 ||
        !verificationCheck[0].address_line ||
        !verificationCheck[0].city ||
        !verificationCheck[0].country) {
      return res.status(400).json({
        success: false,
        message: 'Please update your address information before submitting verification'
      });
    }

    const documentPath = `/uploads/documents/${req.file.filename}`;

    // Check if verification record exists
    const [existing] = await db.execute(
      'SELECT id FROM client_verifications WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record - automatically approve
      await db.execute(
        `UPDATE client_verifications
        SET id_document_url = ?,
            date_of_birth = ?,
            government_id_number = ?,
            verification_status = 'approved',
            verified_at = CURRENT_TIMESTAMP,
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [documentPath, dateOfBirth, governmentIdNumber, userId]
      );
    } else {
      // Create new record - automatically approved
      await db.execute(
        `INSERT INTO client_verifications (
          user_id,
          id_document_url,
          date_of_birth,
          government_id_number,
          verification_status,
          verified_at,
          reviewed_at
        )
        VALUES (?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, documentPath, dateOfBirth, governmentIdNumber]
      );
    }

    console.log(`✅ Client verification auto-approved for user ${userId}:`, {
      dateOfBirth,
      governmentIdNumber: governmentIdNumber.substring(0, 4) + '****', // Log partial for security
      documentPath,
      status: 'approved'
    });

    res.json({
      success: true,
      message: 'Verification successful! Your identity has been verified.'
    });

  } catch (error) {
    console.error('❌ Error submitting verification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get verification status
 */
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await db.execute(
      `SELECT
        verification_status,
        verified_at,
        created_at
      FROM client_verifications
      WHERE user_id = ?`,
      [userId]
    );

    const verification = results[0] || { verification_status: 'not_submitted' };

    res.json({
      status: 'success',
      data: verification
    });

  } catch (error) {
    console.error('❌ Error fetching verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  submitVerification,
  getVerificationStatus
};

