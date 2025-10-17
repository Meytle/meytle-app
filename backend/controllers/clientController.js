/**
 * Client Controller
 * Handles client-specific operations like profile management and identity verification
 */

const db = require('../config/database');
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
        phone_number,
        location,
        bio,
        verification_status,
        verified_at,
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
    const { fullName, phoneNumber, location, bio } = req.body;

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
        SET phone_number = ?, location = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [phoneNumber, location, bio, userId]
      );
    } else {
      // Create new record
      await db.execute(
        `INSERT INTO client_verifications (user_id, phone_number, location, bio)
        VALUES (?, ?, ?, ?)`,
        [userId, phoneNumber, location, bio]
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

    const documentPath = `/uploads/documents/${req.file.filename}`;

    // Check if verification record exists
    const [existing] = await db.execute(
      'SELECT id FROM client_verifications WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        `UPDATE client_verifications 
        SET id_document_url = ?, date_of_birth = ?, government_id_number = ?, verification_status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [documentPath, dateOfBirth, governmentIdNumber, userId]
      );
    } else {
      // Create new record
      await db.execute(
        `INSERT INTO client_verifications (user_id, id_document_url, date_of_birth, government_id_number, verification_status)
        VALUES (?, ?, ?, ?, 'pending')`,
        [userId, documentPath, dateOfBirth, governmentIdNumber]
      );
    }

    console.log(`✅ Client verification submitted by user ${userId}:`, {
      dateOfBirth,
      governmentIdNumber: governmentIdNumber.substring(0, 4) + '****', // Log partial for security
      documentPath
    });

    res.json({
      success: true,
      message: 'Verification submitted successfully. We\'ll review it within 24 hours.'
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

    const [verifications] = await db.execute(
      `SELECT 
        verification_status,
        verified_at,
        created_at
      FROM client_verifications
      WHERE user_id = ?`,
      [userId]
    );

    const verification = verifications[0] || { verification_status: 'not_submitted' };

    res.json({
      success: true,
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

