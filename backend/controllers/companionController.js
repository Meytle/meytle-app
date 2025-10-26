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
    const {
      dateOfBirth,
      governmentIdNumber,
      phoneNumber,
      backgroundCheckConsent,
      addressLine,
      city,
      state,
      country,
      postalCode,
      interests,
      bio,
      servicesOffered,
      languages,
      hourlyRate
    } = req.body;

    // Log received data for debugging
    console.log('📥 Received application data:', {
      userId,
      dateOfBirth,
      governmentIdNumber,
      backgroundCheckConsent,
      addressLine,
      city,
      state,
      country,
      postalCode,
      hasFiles: !!req.files,
      files: req.files ? Object.keys(req.files) : []
    });

    // Validate required fields
    if (!dateOfBirth || !governmentIdNumber || !addressLine || !city || !state || !country || !postalCode) {
      console.log('❌ Missing required fields:', {
        dateOfBirth,
        governmentIdNumber,
        addressLine,
        city,
        state,
        country,
        postalCode
      });
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields including complete address'
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
    const [existingApps] = await pool.execute(
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

    // Insert application with all fields including new ones
    const [result] = await pool.execute(
      `INSERT INTO companion_applications
       (user_id, profile_photo_url, government_id_url, date_of_birth, government_id_number,
        phone_number, address_line, city, state, country, postal_code, bio,
        services_offered, languages, hourly_rate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, profilePhotoUrl, governmentIdUrl, dateOfBirth, governmentIdNumber,
        phoneNumber || null, addressLine, city, state, country, postalCode, bio || null,
        servicesOffered || null, languages || null, hourlyRate || 50, 'pending'
      ]
    );

    // Save interests if provided
    if (interests) {
      // Parse interests if it's a JSON string
      let interestArray = interests;
      if (typeof interests === 'string') {
        try {
          interestArray = JSON.parse(interests);
        } catch (e) {
          console.error('Failed to parse interests JSON:', e);
          interestArray = [];
        }
      }

      if (Array.isArray(interestArray) && interestArray.length > 0) {
        for (const interest of interestArray) {
          try {
            await pool.execute(
              'INSERT INTO companion_interests (companion_id, interest_name) VALUES (?, ?)',
              [userId, interest]
            );
          } catch (interestError) {
            console.error('Failed to save interest:', interest, interestError);
            // Continue with other interests even if one fails
          }
        }
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully. An admin will review it within 24-48 hours.',
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

    const [applications] = await pool.execute(
      `SELECT id, user_id, profile_photo_url, government_id_url, status, created_at, reviewed_at, rejection_reason,
       phone_number, address_line, city, state, country, postal_code, bio, services_offered, languages, hourly_rate
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
    const [result] = await pool.execute(
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
        ca.bio,
        ca.city,
        ca.state,
        ca.country,
        ca.created_at as joined_date,
        ca.services_offered,
        ca.languages,
        ca.hourly_rate
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
    
    const [companions] = await pool.execute(query, queryParams);

    // Get interests for each companion
    const companionsWithInterests = await Promise.all(
      companions.map(async (companion) => {
        const [interests] = await pool.execute(
          'SELECT interest_name FROM companion_interests WHERE companion_id = ?',
          [companion.id]
        );
        
        const birthDate = new Date(companion.date_of_birth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        // Build location string
        const locationParts = [];
        if (companion.city) locationParts.push(companion.city);
        if (companion.state) locationParts.push(companion.state);
        if (companion.country) locationParts.push(companion.country);
        const location = locationParts.join(', ');

        return {
          ...companion,
          age,
          interests: interests.map(i => i.interest_name),
          location: location || null,
          bio: companion.bio || null,
          services_offered: companion.services_offered ?
            (typeof companion.services_offered === 'string' ?
              JSON.parse(companion.services_offered) : companion.services_offered) : [],
          languages: companion.languages ?
            (typeof companion.languages === 'string' ?
              JSON.parse(companion.languages) : companion.languages) : [],
          hourly_rate: companion.hourly_rate || null,
          // Remove sensitive data
          email: undefined,
          date_of_birth: undefined,
          city: undefined,
          state: undefined,
          country: undefined
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
    await pool.execute(
      'DELETE FROM companion_interests WHERE companion_id = ?',
      [userId]
    );

    // Insert new interests
    for (const interest of interests) {
      try {
        await pool.execute(
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

    const [interests] = await pool.execute(
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

/**
 * Default services for companions
 */
const DEFAULT_COMPANION_SERVICES = [
  'Travel Companion',
  'Social Companion',
  'Event Companion',
  'Wine Tasting',
  'City Tours',
  'Museum Visits',
  'Theater & Arts',
  'Outdoor Activities',
  'Business Events',
  'Dinner Companion'
];

/**
 * Get companion's registered services
 */
const getCompanionServices = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🔍 Fetching services for companion:', userId);

    // Get services from companion application
    const [applications] = await pool.execute(
      `SELECT services_offered, status FROM companion_applications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    console.log('📊 Query result:', applications);

    if (applications.length === 0) {
      console.log('⚠️ No application found for user:', userId, '- returning default services');
      // Return default services instead of error so companion can still set availability
      return res.status(200).json({
        status: 'success',
        data: {
          services: DEFAULT_COMPANION_SERVICES,
          isDefault: true
        }
      });
    }

    console.log('📝 Raw services_offered value:', applications[0].services_offered);
    console.log('📝 Type of services_offered:', typeof applications[0].services_offered);

    // Parse services if stored as JSON
    let services = [];
    if (applications[0].services_offered) {
      try {
        // Try to parse as JSON if it's a string
        if (typeof applications[0].services_offered === 'string') {
          services = JSON.parse(applications[0].services_offered);
        } else {
          services = applications[0].services_offered;
        }
      } catch (e) {
        console.error('Failed to parse services JSON:', e);
        console.error('Raw value that failed to parse:', applications[0].services_offered);
        // If parsing fails, try to use as is or split by comma
        if (typeof applications[0].services_offered === 'string') {
          // Check if it's a comma-separated string
          services = applications[0].services_offered.split(',').map(s => s.trim());
        } else {
          services = [];
        }
      }
    } else {
      console.log('⚠️ services_offered is null or undefined');
    }

    console.log('✅ Parsed services:', services);
    console.log('✅ Is array?:', Array.isArray(services));

    // If no services are registered, return default services
    if (!services || (Array.isArray(services) && services.length === 0)) {
      console.log('⚠️ No services registered - returning default services');
      return res.status(200).json({
        status: 'success',
        data: {
          services: DEFAULT_COMPANION_SERVICES,
          isDefault: true
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        services: Array.isArray(services) ? services : [],
        isDefault: false
      }
    });
  } catch (error) {
    console.error('Get companion services error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companion services',
      error: error.message
    });
  }
};

/**
 * Update companion profile data
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phoneNumber,
      bio,
      services,
      languages,
      hourlyRate
    } = req.body;

    console.log('📝 Updating profile for user:', userId);
    console.log('Data received:', { phoneNumber, bio, services, languages, hourlyRate });

    // Convert arrays to JSON strings for storage
    const servicesJson = services ? JSON.stringify(services) : null;
    const languagesJson = languages ? JSON.stringify(languages) : null;

    // Update companion application data
    const [result] = await pool.execute(
      `UPDATE companion_applications
       SET phone_number = ?, bio = ?, services_offered = ?, languages = ?, hourly_rate = ?
       WHERE user_id = ?`,
      [phoneNumber, bio, servicesJson, languagesJson, hourlyRate, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No application found to update'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        phoneNumber,
        bio,
        services,
        languages,
        hourlyRate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  submitApplication,
  getApplicationStatus,
  updateProfilePhoto,
  updateProfile,
  getApprovedCompanions,
  saveInterests,
  getCompanionInterests,
  getCompanionServices
};
