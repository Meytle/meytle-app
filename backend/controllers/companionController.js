/**
 * Companion Controller
 * Handles companion application submissions
 */

const { pool } = require('../config/database');

/**
 * Submit companion application
 */
const submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateOfBirth, governmentIdNumber, backgroundCheckConsent, interests, bio } = req.body;

    // Log received data for debugging
    console.log('📥 Received application data:', {
      userId,
      dateOfBirth,
      governmentIdNumber,
      backgroundCheckConsent,
      hasFiles: !!req.files,
      files: req.files ? Object.keys(req.files) : []
    });

    // Validate required fields
    if (!dateOfBirth || !governmentIdNumber) {
      console.log('❌ Missing required fields:', { dateOfBirth, governmentIdNumber });
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: dateOfBirth, governmentIdNumber'
      });
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return res.status(400).json({
        status: 'error',
        message: 'You must be at least 18 years old to become a companion'
      });
    }

    // Check if user already has an application
    const [existingApps] = await pool.query(
      'SELECT id FROM companion_applications WHERE user_id = ?',
      [userId]
    );

    if (existingApps.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already submitted an application'
      });
    }

    // Handle file uploads
    // Files are saved by multer, we store the paths in the database
    const profilePhotoUrl = req.files?.profilePhoto ? `/uploads/profiles/${req.files.profilePhoto[0].filename}` : null;
    const governmentIdUrl = req.files?.governmentId ? `/uploads/documents/${req.files.governmentId[0].filename}` : null;

    console.log('📁 Files uploaded:', {
      profilePhoto: profilePhotoUrl,
      governmentId: governmentIdUrl
    });

    // Insert application
    const [result] = await pool.query(
      `INSERT INTO companion_applications 
       (user_id, profile_photo_url, government_id_url, date_of_birth, government_id_number, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, profilePhotoUrl, governmentIdUrl, dateOfBirth, governmentIdNumber, 'pending']
    );

    // Save interests if provided
    if (interests && Array.isArray(interests) && interests.length > 0) {
      for (const interest of interests) {
        try {
          await pool.query(
            'INSERT INTO companion_interests (companion_id, interest_name) VALUES (?, ?)',
            [userId, interest]
          );
        } catch (interestError) {
          console.error('Failed to save interest:', interest, interestError);
          // Continue with other interests even if one fails
        }
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully. We will review it within 24-48 hours.',
      data: {
        applicationId: result.insertId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit application. Please try again.',
      error: error.message
    });
  }
};

/**
 * Get application status
 */
const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    console.log('🔍 Fetching application for user:', { userId, email: userEmail });

    const [applications] = await pool.query(
      `SELECT id, user_id, profile_photo_url, government_id_url, status, created_at, reviewed_at, rejection_reason 
       FROM companion_applications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (applications.length === 0) {
      console.log('❌ No application found for user:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'No application found'
      });
    }

    console.log('✅ Found application:', {
      id: applications[0].id,
      user_id: applications[0].user_id,
      profile_photo_url: applications[0].profile_photo_url,
      status: applications[0].status
    });

    res.status(200).json({
      status: 'success',
      data: {
        application: applications[0]
      }
    });
  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch application status',
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
    const userEmail = req.user.email;

    console.log('📸 Updating profile photo for user:', { userId, email: userEmail });

    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a profile photo'
      });
    }

    const profilePhotoUrl = `/uploads/profiles/${req.file.filename}`;

    console.log('📁 New photo:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: profilePhotoUrl
    });

    // Update the profile photo URL in the companion_applications table
    const [result] = await pool.query(
      `UPDATE companion_applications 
       SET profile_photo_url = ? 
       WHERE user_id = ?`,
      [profilePhotoUrl, userId]
    );

    console.log('✅ Photo updated, rows affected:', result.affectedRows);

    if (result.affectedRows === 0) {
      console.log('⚠️ No application found to update for user:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'No application found to update'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: {
        profilePhotoUrl: profilePhotoUrl
      }
    });
  } catch (error) {
    console.error('❌ Update profile photo error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile photo',
      error: error.message
    });
  }
};

/**
 * Get all approved companions for browsing
 */
const getApprovedCompanions = async (req, res) => {
  try {
    const { interests } = req.query;
    
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        ca.profile_photo_url,
        ca.date_of_birth,
        ca.created_at as joined_date
      FROM users u
      JOIN companion_applications ca ON u.id = ca.user_id
      JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'companion' AND ur.is_active = TRUE
      WHERE ca.status = 'approved'
    `;
    
    const queryParams = [];
    
    // Filter by interests if provided
    if (interests) {
      const interestList = interests.split(',').map(i => i.trim());
      query += ` AND u.id IN (
        SELECT companion_id FROM companion_interests 
        WHERE interest_name IN (${interestList.map(() => '?').join(',')})
      )`;
      queryParams.push(...interestList);
    }
    
    query += ' ORDER BY ca.created_at DESC';
    
    const [companions] = await pool.query(query, queryParams);

    // Get interests for each companion
    const companionsWithInterests = await Promise.all(
      companions.map(async (companion) => {
        const [interests] = await pool.query(
          'SELECT interest_name FROM companion_interests WHERE companion_id = ?',
          [companion.id]
        );
        
        const birthDate = new Date(companion.date_of_birth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        return {
          ...companion,
          age,
          interests: interests.map(i => i.interest_name),
          // Remove sensitive data
          email: undefined,
          date_of_birth: undefined
        };
      })
    );

    res.json({
      status: 'success',
      data: companionsWithInterests
    });
  } catch (error) {
    console.error('Get approved companions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companions',
      error: error.message
    });
  }
};

/**
 * Save or update companion interests
 */
const saveInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body;

    if (!interests || !Array.isArray(interests)) {
      return res.status(400).json({
        status: 'error',
        message: 'Interests must be an array'
      });
    }

    // Clear existing interests
    await pool.query(
      'DELETE FROM companion_interests WHERE companion_id = ?',
      [userId]
    );

    // Insert new interests
    for (const interest of interests) {
      try {
        await pool.query(
          'INSERT INTO companion_interests (companion_id, interest_name) VALUES (?, ?)',
          [userId, interest]
        );
      } catch (interestError) {
        console.error('Failed to save interest:', interest, interestError);
        // Continue with other interests even if one fails
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Interests updated successfully',
      data: { interests }
    });
  } catch (error) {
    console.error('Save interests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save interests',
      error: error.message
    });
  }
};

/**
 * Get companion interests
 */
const getCompanionInterests = async (req, res) => {
  try {
    const { companionId } = req.params;

    const [interests] = await pool.query(
      'SELECT interest_name FROM companion_interests WHERE companion_id = ?',
      [companionId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        interests: interests.map(i => i.interest_name)
      }
    });
  } catch (error) {
    console.error('Get companion interests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch interests',
      error: error.message
    });
  }
};

module.exports = {
  submitApplication,
  getApplicationStatus,
  updateProfilePhoto,
  getApprovedCompanions,
  saveInterests,
  getCompanionInterests
};
