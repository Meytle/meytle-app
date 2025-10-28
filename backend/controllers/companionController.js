/**
 * Companion Controller
 * Handles companion application submissions
 */

const { pool } = require('../config/database');
const { transformToFrontend, transformArrayToFrontend } = require('../utils/transformer');
const logger = require('../services/logger');

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
    logger.controllerInfo('companionController', 'submitApplication', 'Received application data', {
      userId,
      dateOfBirth: dateOfBirth ? 'provided' : 'missing',
      governmentIdNumber: governmentIdNumber ? 'provided' : 'missing',
      backgroundCheckConsent,
      addressLine: addressLine ? 'provided' : 'missing',
      city,
      state,
      country,
      postalCode,
      hasFiles: !!req.files,
      files: req.files ? Object.keys(req.files) : []
    });

    // Validate required fields
    if (!dateOfBirth || !governmentIdNumber || !addressLine || !city || !state || !country || !postalCode) {
      logger.warn('Missing required fields in companion application', {
        userId,
        missingFields: {
          dateOfBirth: !dateOfBirth,
          governmentIdNumber: !governmentIdNumber,
          addressLine: !addressLine,
          city: !city,
          state: !state,
          country: !country,
          postalCode: !postalCode
        }
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

    logger.info('Files uploaded for companion application', {
      userId,
      profilePhoto: profilePhotoUrl ? 'uploaded' : 'not provided',
      governmentId: governmentIdUrl ? 'uploaded' : 'not provided'
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
          logger.warn('Failed to parse interests JSON', {
            userId,
            error: e.message,
            interests: interests
          });
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
            logger.dbError('insertInterest', interestError, `INSERT INTO companion_interests for interest: ${interest}`);
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
    logger.controllerError('companionController', 'submitApplication', error, req);
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

    logger.info('Fetching application for user', { userId, email: userEmail });

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
      logger.info('No application found for user', { userId });
      return res.status(404).json({
        status: 'error',
        message: 'No application found'
      });
    }

    logger.info('Found application', {
      applicationId: applications[0].id,
      userId: applications[0].user_id,
      status: applications[0].status
    });

    res.status(200).json({
      status: 'success',
      data: transformToFrontend({
        application: applications[0]
      })
    });
  } catch (error) {
    logger.controllerError('companionController', 'getApplicationStatus', error, req);
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

    logger.controllerInfo('companionController', 'updateProfilePhoto', 'Updating profile photo', { userId, email: userEmail });

    // Check if file was uploaded
    if (!req.file) {
      logger.warn('No file uploaded for profile photo update', { userId });
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a profile photo'
      });
    }

    const profilePhotoUrl = `/uploads/profiles/${req.file.filename}`;

    logger.info('New profile photo uploaded', {
      userId,
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

    logger.info('Photo updated successfully', { userId, rowsAffected: result.affectedRows });

    if (result.affectedRows === 0) {
      logger.warn('No application found to update for user', { userId });
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
    logger.controllerError('companionController', 'updateProfilePhoto', error, req);
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

        // Keep the raw companion data from DB and add computed fields
        return {
          ...companion,
          age,
          interests: interests.map(i => i.interest_name),
          location: location || null,
          // Remove sensitive data
          email: undefined,
          date_of_birth: undefined,
          city: undefined,
          state: undefined,
          country: undefined
        };
      })
    );

    // Transform to frontend format and handle JSON parsing
    const transformedCompanions = transformArrayToFrontend(companionsWithInterests).map(companion => {
      // Parse JSON fields after transformation
      if (companion.servicesOffered) {
        companion.servicesOffered = typeof companion.servicesOffered === 'string'
          ? JSON.parse(companion.servicesOffered)
          : companion.servicesOffered || [];
      }
      if (companion.languages) {
        companion.languages = typeof companion.languages === 'string'
          ? JSON.parse(companion.languages)
          : companion.languages || [];
      }
      return companion;
    });

    res.json({
      status: 'success',
      data: transformedCompanions
    });
  } catch (error) {
    logger.controllerError('companionController', 'getApprovedCompanions', error, req);
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
        logger.dbError('insertInterest', interestError, `INSERT INTO companion_interests for interest: ${interest}`);
        // Continue with other interests even if one fails
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Interests updated successfully',
      data: { interests }
    });
  } catch (error) {
    logger.controllerError('companionController', 'saveInterests', error, req);
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
    logger.controllerError('companionController', 'getInterests', error, req);
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

    logger.controllerInfo('companionController', 'getCompanionServices', 'Fetching services for companion', { userId });

    // Get services from companion application
    const [applications] = await pool.execute(
      `SELECT services_offered, status FROM companion_applications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    logger.debug('Query result for companion services', {
      userId,
      hasResults: applications.length > 0
    });

    if (applications.length === 0) {
      logger.info('No application found for user - returning default services', { userId });
      // Return default services instead of error so companion can still set availability
      return res.status(200).json({
        status: 'success',
        data: transformToFrontend({
          services: DEFAULT_COMPANION_SERVICES,
          is_default: true
        })
      });
    }

    logger.debug('Raw services_offered value', {
      userId,
      servicesOffered: applications[0].services_offered,
      servicesOfferedType: typeof applications[0].services_offered
    });

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
        logger.warn('Failed to parse services JSON', {
          userId,
          error: e.message,
          rawValue: applications[0].services_offered
        });
        // If parsing fails, try to use as is or split by comma
        if (typeof applications[0].services_offered === 'string') {
          // Check if it's a comma-separated string
          services = applications[0].services_offered.split(',').map(s => s.trim());
        } else {
          services = [];
        }
      }
    } else {
      logger.debug('services_offered is null or undefined', { userId });
    }

    logger.debug('Parsed services successfully', {
      userId,
      services: services,
      isArray: Array.isArray(services)
    });

    // If no services are registered, return default services
    if (!services || (Array.isArray(services) && services.length === 0)) {
      logger.info('No services registered - returning default services', { userId });
      return res.status(200).json({
        status: 'success',
        data: transformToFrontend({
          services: DEFAULT_COMPANION_SERVICES,
          is_default: true
        })
      });
    }

    res.status(200).json({
      status: 'success',
      data: transformToFrontend({
        services: Array.isArray(services) ? services : [],
        is_default: false
      })
    });
  } catch (error) {
    logger.controllerError('companionController', 'getCompanionServices', error, req);
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

    logger.controllerInfo('companionController', 'updateProfile', 'Updating companion profile', {
      userId,
      hasPhoneNumber: !!phoneNumber,
      hasBio: !!bio,
      hasServices: !!services,
      hasLanguages: !!languages,
      hourlyRate
    });

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
      data: transformToFrontend({
        phone_number: phoneNumber,
        bio: bio,
        services_offered: services,
        languages: languages,
        hourly_rate: hourlyRate
      })
    });
  } catch (error) {
    logger.controllerError('companionController', 'updateProfile', error, req);
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
