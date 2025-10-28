/**
 * Booking Controller
 * Handles booking creation, management, and availability
 * (Simplified version without payment processing)
 */

const { pool } = require('../config/database');
const { sendBookingNotificationEmail } = require('../services/emailService');
const { validateBookingAddress } = require('../utils/addressValidation');
const { transformToFrontend, transformArrayToFrontend } = require('../utils/transformer');
const logger = require('../services/logger');

/**
 * Create a new booking (without payment processing)
 */
const createBooking = async (req, res) => {
  let connection;

  try {
    // Get a connection from the pool for transaction support
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const clientId = req.user.id;
    const {
      companionId,
      bookingDate,
      startTime,
      endTime,
      specialRequests,
      meetingLocation,
      serviceCategoryId,
      meetingType,
      customService // New field for custom service { name, description }
    } = req.body;

    // Validate required fields
    if (!companionId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: companionId, bookingDate, startTime, endTime'
      });
    }

    // Validate that either serviceCategoryId OR customService is provided (not both)
    // If neither is provided, we'll use a standard service as fallback
    if (serviceCategoryId && customService) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select either a predefined service or a custom service, not both'
      });
    }

    // If no service is specified at all, use a default standard service
    const isUsingDefaultService = !serviceCategoryId && !customService;
    if (isUsingDefaultService) {
      logger.controllerInfo('bookingController', 'createBooking', 'No service specified, using standard service', {});
    }

    // Validate custom service if provided
    if (customService) {
      if (!customService.name || customService.name.trim().length < 3) {
        return res.status(400).json({
          status: 'error',
          message: 'Custom service name must be at least 3 characters long'
        });
      }

      if (customService.name.length > 255) {
        return res.status(400).json({
          status: 'error',
          message: 'Custom service name must not exceed 255 characters'
        });
      }

      if (customService.description && customService.description.length > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'Custom service description must not exceed 1000 characters'
        });
      }
    }

    // Prevent self-booking
    if (clientId === parseInt(companionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot book yourself as a companion'
      });
    }

    // Validate date is not in the past
    const bookingDateTime = new Date(`${bookingDate} ${startTime}`);
    if (bookingDateTime <= new Date()) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Booking date and time must be in the future'
      });
    }

    // Check if companion exists and is approved, and get email for notification
    const [companions] = await connection.execute(
      `SELECT u.id, u.name, u.email, ca.status
       FROM users u
       JOIN companion_applications ca ON u.id = ca.user_id
       JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'companion' AND ur.is_active = TRUE
       WHERE u.id = ? AND ca.status = 'approved'`,
      [companionId]
    );

    if (companions.length === 0) {
      if (connection) await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Companion not found or not approved'
      });
    }

    const companion = companions[0];

    // Validate and fetch service category if provided
    let categoryBasePrice = null;
    if (serviceCategoryId) {
      const [categories] = await connection.execute(
        'SELECT id, base_price FROM service_categories WHERE id = ? AND is_active = TRUE',
        [serviceCategoryId]
      );

      if (categories.length === 0) {
        if (connection) await connection.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Service category not found or inactive'
        });
      }

      categoryBasePrice = categories[0].base_price;
    }

    // Validate meetingType if provided
    if (meetingType && !['in_person', 'virtual'].includes(meetingType)) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid meeting type. Must be in_person or virtual'
      });
    }

    // Validate meeting location using the validation helper
    const addressValidation = validateBookingAddress({
      meetingLocation,
      meetingType,
      meeting_location_lat: req.body.meetingLocationLat || req.body.meeting_location_lat,
      meeting_location_lon: req.body.meetingLocationLon || req.body.meeting_location_lon,
      meeting_location_place_id: req.body.meetingLocationPlaceId || req.body.meeting_location_place_id
    });

    if (!addressValidation.isValid) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Address validation failed',
        errors: addressValidation.errors
      });
    }

    // Log warnings if any (but don't block the booking)
    if (addressValidation.warnings.length > 0) {
      logger.warn('Address validation warnings', { warnings: addressValidation.warnings });
    }

    // Check for conflicting bookings
    const [conflictingBookings] = await connection.execute(
      `SELECT id FROM bookings
       WHERE companion_id = ? AND booking_date = ?
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
       AND status IN ('pending', 'confirmed')`,
      [companionId, bookingDate, startTime, startTime, endTime, endTime]
    );

    if (conflictingBookings.length > 0) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Time slot is already booked'
      });
    }

    // Validate endTime > startTime
    const start = new Date(`${bookingDate} ${startTime}`);
    const end = new Date(`${bookingDate} ${endTime}`);

    if (end <= start) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time'
      });
    }

    // Calculate duration
    const durationHours = (end - start) / (1000 * 60 * 60);

    // Validate duration is reasonable (at least 1 hour, max 12 hours)
    if (durationHours < 1) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Booking duration must be at least 1 hour'
      });
    }

    if (durationHours > 12) {
      if (connection) await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Booking duration cannot exceed 12 hours'
      });
    }

    // Calculate total amount (for display purposes only - no actual payment)
    const hourlyRate = categoryBasePrice || 35;
    const totalAmount = Math.round(durationHours * hourlyRate * 100) / 100;

    // Create booking - removing non-existent custom service columns
    // Ensure no undefined values are passed to MySQL
    const bookingParams = [
      clientId,
      companionId,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      totalAmount,
      specialRequests || null,
      meetingLocation || null,
      serviceCategoryId || null,
      meetingType || 'in_person'
    ];

    const [result] = await connection.execute(
      `INSERT INTO bookings
       (client_id, companion_id, booking_date, start_time, end_time, duration_hours, total_amount,
        special_requests, meeting_location, service_category_id, meeting_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      bookingParams
    );

    const bookingId = result.insertId;

    // Get client information for the email
    const [clientInfo] = await connection.execute(
      'SELECT name FROM users WHERE id = ?',
      [clientId]
    );
    const clientName = clientInfo[0]?.name || 'Client';

    // Get service category name if applicable
    let serviceName = 'Standard Service';
    if (serviceCategoryId) {
      const [categories] = await connection.execute(
        'SELECT name FROM service_categories WHERE id = ?',
        [serviceCategoryId]
      );
      serviceName = categories[0]?.name || 'Standard Service';
    }

    // Commit transaction before sending email (email is not critical)
    await connection.commit();

    // Send email notification to companion
    try {
      await sendBookingNotificationEmail(companion.email, {
        companionName: companion.name,
        clientName: clientName,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        durationHours: durationHours,
        totalAmount: totalAmount,
        serviceName: serviceName,
        meetingLocation: meetingLocation,
        meetingType: meetingType || 'in_person',
        specialRequests: specialRequests
      });
      logger.controllerInfo('bookingController', 'createBooking', 'Booking notification sent', { email: companion.email });
    } catch (emailError) {
      // Log error but don't fail the booking
      logger.controllerError('bookingController', 'createBooking', emailError, req);
    }

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully. Awaiting companion confirmation.',
      data: {
        bookingId: bookingId,
        totalAmount,
        durationHours
      }
    });

  } catch (error) {
    logger.controllerError('bookingController', 'createBooking', error, req);

    // Rollback transaction on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logger.controllerError('bookingController', 'createBooking', rollbackError, req);
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
      error: error.message
    });
  } finally {
    // Always release connection back to pool
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Get bookings for a user (client or companion)
 */
const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    // Support both legacy role and new activeRole from multi-role architecture
    // When called from companion dashboard, user should have activeRole = 'companion'
    let userRole = req.user.role || req.user.activeRole || 'client';

    // Safety check: If userRole is 'client', double-check if user has companion role
    // This ensures companions always see their bookings even if role switching failed
    if (userRole === 'client') {
      const [companionRole] = await pool.execute(
        'SELECT role FROM user_roles WHERE user_id = ? AND role = "companion" AND is_active = TRUE',
        [userId]
      );

      if (companionRole.length > 0) {
        logger.controllerInfo('bookingController', 'getBookings', 'User has companion role but was using client role. Switching to companion view', { userId });
        userRole = 'companion';
      }
    }

    // Log for debugging
    logger.controllerInfo('bookingController', 'getBookings', 'Getting bookings for user', {
      userId,
      role: userRole,
      roles: req.user.roles,
      activeRole: req.user.activeRole
    });

    const { status } = req.query;

    // Properly parse and validate pagination parameters
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validate parsed values and ensure they are integers
    const validLimit = Math.floor(isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100));
    const validOffset = Math.floor(isNaN(offset) || offset < 0 ? 0 : offset);

    // Build query based on user role
    let query;
    if (userRole === 'client') {
      query = `
        SELECT
          b.id,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.duration_hours,
          b.total_amount,
          b.status,
          b.special_requests,
          b.meeting_location,
          b.meeting_type,
          b.created_at,
          b.service_category_id,
          sc.name as service_category_name,
          sc.base_price as service_category_price,
          u.name as companion_name,
          u.email as companion_email,
          ca.profile_photo_url as companion_photo
        FROM bookings b
        JOIN users u ON b.companion_id = u.id
        LEFT JOIN companion_applications ca ON u.id = ca.user_id
        LEFT JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.client_id = ?
      `;
    } else {
      query = `
        SELECT
          b.id,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.duration_hours,
          b.total_amount,
          b.status,
          b.special_requests,
          b.meeting_location,
          b.meeting_type,
          b.created_at,
          b.service_category_id,
          sc.name as service_category_name,
          sc.base_price as service_category_price,
          u.name as client_name,
          u.email as client_email
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        LEFT JOIN service_categories sc ON b.service_category_id = sc.id
        WHERE b.companion_id = ?
      `;
    }

    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    // Use string interpolation for LIMIT and OFFSET since they're already validated integers
    query += ` ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ${validLimit} OFFSET ${validOffset}`;

    // Debug logging for companion queries
    if (userRole === 'companion') {
      logger.controllerInfo('bookingController', 'getBookings', 'Executing companion query', { userId, params });
    }

    const [bookings] = await pool.execute(query, params);

    // Log the raw results for debugging
    logger.controllerInfo('bookingController', 'getBookings', 'Found bookings', {
      count: bookings.length,
      userRole,
      userId,
      firstBooking: userRole === 'companion' && bookings.length > 0 ? bookings[0] : undefined
    });

    // Transform bookings to camelCase for frontend consistency
    const transformedBookings = bookings.map(booking => {
      const transformed = transformToFrontend(booking);

      // Cast service_category_price to number
      if (transformed.serviceCategoryPrice !== null && transformed.serviceCategoryPrice !== undefined) {
        transformed.serviceCategoryPrice = Number(transformed.serviceCategoryPrice);
      }

      // Validate and clean date fields to prevent "Invalid Date" display
      if (transformed.bookingDate) {
        const dateObj = new Date(transformed.bookingDate);
        // If date is invalid, set to null rather than sending invalid data
        if (isNaN(dateObj.getTime())) {
          logger.warn('Invalid booking date found', { bookingId: transformed.id, bookingDate: transformed.bookingDate });
          transformed.bookingDate = null;
        }
      }

      // Validate time fields
      if (transformed.startTime && !transformed.startTime.includes(':')) {
        logger.warn('Invalid start time found', { bookingId: transformed.id, startTime: transformed.startTime });
        transformed.startTime = null;
      }

      if (transformed.endTime && !transformed.endTime.includes(':')) {
        logger.warn('Invalid end time found', { bookingId: transformed.id, endTime: transformed.endTime });
        transformed.endTime = null;
      }

      return transformed;
    });

    res.json({
      status: 'success',
      data: transformedBookings
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getBookings', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Get a single booking by ID
 */
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const [bookings] = await pool.execute(
      `SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration_hours,
        b.total_amount,
        b.status,
        b.special_requests,
        b.meeting_location,
        b.meeting_type,
        b.created_at,
        b.service_category_id,
        sc.name as service_category_name,
        sc.base_price as service_category_price,
        u.name as companion_name,
        u.email as companion_email,
        ca.profile_photo_url as companion_photo,
        c.name as client_name,
        c.email as client_email
      FROM bookings b
      JOIN users u ON b.companion_id = u.id
      JOIN users c ON b.client_id = c.id
      LEFT JOIN companion_applications ca ON u.id = ca.user_id
      LEFT JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE b.id = ? AND (b.client_id = ? OR b.companion_id = ?)`,
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or access denied'
      });
    }

    const booking = bookings[0];

    // Transform to camelCase for frontend
    const transformedBooking = transformToFrontend(booking);

    // Cast service_category_price to number
    if (transformedBooking.serviceCategoryPrice !== null) {
      transformedBooking.serviceCategoryPrice = Number(transformedBooking.serviceCategoryPrice);
    }

    res.json({
      status: 'success',
      data: transformedBooking
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getBookingById', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // First, fetch the booking row and permission-check the caller
    const [bookings] = await pool.execute(
      `SELECT id, status, companion_id FROM bookings
       WHERE id = ? AND (client_id = ? OR companion_id = ?)`,
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or access denied'
      });
    }

    const booking = bookings[0];

    // Add logging to confirm execution order and that booking is defined
    logger.controllerInfo('bookingController', 'updateBookingStatus', 'Booking fetched successfully', {
      bookingId,
      currentStatus: booking.status,
      userRole,
      requestedStatus: status
    });

    // Now set currentStatus after fetching booking
    const currentStatus = booking.status;

    // Enforce role-based status transitions
    const allowedTransitions = {
      client: {
        'pending': ['cancelled'],
        'confirmed': ['cancelled'],
        'completed': [],
        'cancelled': [],
        'no_show': []
      },
      companion: {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled', 'no_show'],
        'completed': [],
        'cancelled': [],
        'no_show': []
      }
    };

    const allowedStatuses = allowedTransitions[userRole]?.[currentStatus] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        status: 'error',
        message: `You cannot change booking status from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedStatuses.join(', ') || 'none'}`
      });
    }

    // Update booking status
    const [result] = await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    logger.controllerError('bookingController', 'updateBookingStatus', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

/**
 * Get companion availability
 */
const getCompanionAvailability = async (req, res) => {
  try {
    let { companionId } = req.params;
    const { date } = req.query;

    // Handle special case where companionId is '0' or 'me' to mean current user
    if (companionId === '0' || companionId === 'me') {
      companionId = req.user.id;
      logger.controllerInfo('bookingController', 'getCompanionAvailability', 'Fetching availability for current user', { companionId });
    }

    let query = `
      SELECT
        day_of_week,
        start_time,
        end_time,
        is_available,
        services
      FROM companion_availability
      WHERE companion_id = ?
    `;

    const params = [companionId];

    if (date) {
      // Get specific date availability
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      query += ' AND day_of_week = ?';
      params.push(dayOfWeek);
    }

    query += ' ORDER BY day_of_week, start_time';

    const [availability] = await pool.execute(query, params);

    // Transform to camelCase for frontend
    const transformedAvailability = transformArrayToFrontend(availability);

    res.json({
      status: 'success',
      data: transformedAvailability
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getCompanionAvailability', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companion availability',
      error: error.message
    });
  }
};

/**
 * Set companion availability
 */
const setCompanionAvailability = async (req, res) => {
  try {
    const companionId = req.user.id;
    const { availability } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Log availability change attempt
    logger.controllerInfo('bookingController', 'setCompanionAvailability', 'Availability change attempted', {
      companionId,
      ip: userIp
    });

    // Ensure user has companion role
    const [userRoles] = await pool.execute(
      'SELECT role FROM user_roles WHERE user_id = ? AND role = "companion" AND is_active = TRUE',
      [companionId]
    );

    if (userRoles.length === 0) {
      logger.controllerError('bookingController', 'setCompanionAvailability', new Error('Unauthorized availability change attempt - not a companion'), req);
      return res.status(403).json({
        status: 'error',
        message: 'Only companions can set availability'
      });
    }

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        status: 'error',
        message: 'Availability must be an array'
      });
    }

    // Get current availability for audit log
    const [currentAvailability] = await pool.execute(
      'SELECT * FROM companion_availability WHERE companion_id = ?',
      [companionId]
    );

    // Group slots by day for validation
    const slotsByDay = {};
    const validatedSlots = [];

    for (const slot of availability) {
      // Support both naming conventions (camelCase and snake_case)
      const dayOfWeek = slot.day_of_week || slot.dayOfWeek;
      const startTime = slot.start_time || slot.startTime;
      const endTime = slot.end_time || slot.endTime;
      const isAvailable = slot.is_available !== undefined ? slot.is_available : (slot.isAvailable !== undefined ? slot.isAvailable : true);
      const services = slot.services || slot.service || null;

      if (!dayOfWeek || !startTime || !endTime) {
        continue; // Skip invalid entries
      }

      // Validate that start time is before end time
      if (startTime >= endTime) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid time range for ${dayOfWeek}: start time must be before end time`
        });
      }

      // Group by day for overlap checking
      if (!slotsByDay[dayOfWeek]) {
        slotsByDay[dayOfWeek] = [];
      }

      slotsByDay[dayOfWeek].push({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        services
      });

      validatedSlots.push({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        services
      });
    }

    // Check for overlapping slots within each day
    for (const [day, daySlots] of Object.entries(slotsByDay)) {
      if (daySlots.length > 1) {
        // Sort by start time
        daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Check for overlaps
        for (let i = 0; i < daySlots.length - 1; i++) {
          const currentSlot = daySlots[i];
          const nextSlot = daySlots[i + 1];

          if (currentSlot.endTime > nextSlot.startTime) {
            return res.status(400).json({
              status: 'error',
              message: `Overlapping time slots detected for ${day}: ${currentSlot.startTime}-${currentSlot.endTime} overlaps with ${nextSlot.startTime}-${nextSlot.endTime}`
            });
          }
        }
      }
    }

    // Clear existing availability
    await pool.execute('DELETE FROM companion_availability WHERE companion_id = ?', [companionId]);

    // Insert validated slots
    for (const slot of validatedSlots) {
      // Convert services array to JSON string for storage
      const servicesJson = slot.services ? JSON.stringify(slot.services) : null;

      await pool.execute(
        `INSERT INTO companion_availability
         (companion_id, day_of_week, start_time, end_time, is_available, services)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companionId, slot.dayOfWeek, slot.startTime, slot.endTime, slot.isAvailable, servicesJson]
      );
    }

    // Create audit log entry
    try {
      await pool.execute(
        `INSERT INTO availability_audit_log
         (companion_id, action, old_data, new_data, changed_by_id, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          companionId,
          'UPDATE_AVAILABILITY',
          JSON.stringify(currentAvailability), // Old data
          JSON.stringify(validatedSlots), // New data
          companionId, // Changed by the companion themselves
          userIp,
          userAgent
        ]
      );
      logger.controllerInfo('bookingController', 'setCompanionAvailability', 'Audit log created', { companionId });
    } catch (auditError) {
      logger.controllerError('bookingController', 'setCompanionAvailability', auditError, req);
      // Don't fail the request if audit logging fails
    }

    res.json({
      status: 'success',
      message: 'Availability updated successfully',
      slots: validatedSlots.length
    });
  } catch (error) {
    logger.controllerError('bookingController', 'setCompanionAvailability', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

/**
 * Get available time slots for a companion on a specific date
 */
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { companionId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date parameter is required'
      });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get companion's availability for this day
    const [availability] = await pool.execute(
      `SELECT start_time, end_time, is_available
       FROM companion_availability
       WHERE companion_id = ? AND day_of_week = ? AND is_available = TRUE
       ORDER BY start_time`,
      [companionId, dayOfWeek]
    );

    // Get existing bookings for this date
    const [bookings] = await pool.execute(
      `SELECT start_time, end_time
       FROM bookings
       WHERE companion_id = ? AND booking_date = ?
       AND status IN ('pending', 'confirmed')`,
      [companionId, date]
    );

    // Calculate available time slots
    const availableSlots = [];

    for (const slot of availability) {
      const slotStart = new Date(`${date} ${slot.start_time}`);
      const slotEnd = new Date(`${date} ${slot.end_time}`);

      // Check for conflicts with existing bookings
      let hasConflict = false;
      for (const booking of bookings) {
        const bookingStart = new Date(`${date} ${booking.start_time}`);
        const bookingEnd = new Date(`${date} ${booking.end_time}`);

        if ((slotStart < bookingEnd && slotEnd > bookingStart)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        availableSlots.push({
          startTime: slot.start_time,
          endTime: slot.end_time
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        date,
        availableSlots
      }
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getAvailableTimeSlots', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available time slots',
      error: error.message
    });
  }
};

/**
 * Get companion bookings by date range
 */
const getCompanionBookingsByDateRange = async (req, res) => {
  try {
    const { companionId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!companionId || !startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'companionId, startDate, and endDate are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Query bookings for the date range
    const [bookings] = await pool.execute(
      `SELECT id, booking_date, start_time, end_time, status
       FROM bookings
       WHERE companion_id = ? AND booking_date BETWEEN ? AND ?
       AND status IN ('pending', 'confirmed')
       ORDER BY booking_date ASC, start_time ASC`,
      [companionId, startDate, endDate]
    );

    // Transform to camelCase for frontend
    const transformedBookings = transformArrayToFrontend(bookings);

    res.json({
      status: 'success',
      data: transformedBookings
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getCompanionBookingsByDateRange', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companion bookings',
      error: error.message
    });
  }
};

/**
 * Create a review for a completed booking
 * @route POST /api/booking/:bookingId/review
 */
const createReview = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Review must be at least 10 characters long'
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Review must be less than 500 characters'
      });
    }

    await connection.beginTransaction();

    // Get booking details and verify it belongs to the reviewer
    const [booking] = await connection.query(
      `SELECT b.*,
              c.name as client_name,
              comp.name as companion_name
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       JOIN users comp ON b.companion_id = comp.id
       WHERE b.id = ? AND b.client_id = ?`,
      [bookingId, reviewerId]
    );

    if (!booking || booking.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or you do not have permission to review it'
      });
    }

    const bookingData = booking[0];

    // Check if booking is completed
    if (bookingData.status !== 'completed') {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists
    const [existingReview] = await connection.query(
      'SELECT id FROM booking_reviews WHERE booking_id = ?',
      [bookingId]
    );

    if (existingReview && existingReview.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this booking'
      });
    }

    // Create the review
    await connection.query(
      `INSERT INTO booking_reviews (
        booking_id,
        reviewer_id,
        reviewee_id,
        rating,
        review_text
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        bookingId,
        reviewerId,
        bookingData.companion_id,
        rating,
        comment.trim()
      ]
    );

    // Update companion's average rating
    await connection.query(
      `UPDATE users u
       SET u.average_rating = (
         SELECT ROUND(AVG(br.rating), 1)
         FROM booking_reviews br
         WHERE br.reviewee_id = ?
       ),
       u.review_count = (
         SELECT COUNT(*)
         FROM booking_reviews br
         WHERE br.reviewee_id = ?
       )
       WHERE u.id = ?`,
      [bookingData.companion_id, bookingData.companion_id, bookingData.companion_id]
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully'
    });

  } catch (error) {
    await connection.rollback();
    logger.controllerError('bookingController', 'createReview', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit review',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all reviews for a companion
 * @route GET /api/booking/companion/:companionId/reviews
 */
const getCompanionReviews = async (req, res) => {
  try {
    const { companionId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [totalCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM booking_reviews WHERE reviewee_id = ?',
      [companionId]
    );

    // Get reviews with reviewer info
    const [reviews] = await pool.execute(
      `SELECT
        br.id,
        br.rating,
        br.review_text,
        br.created_at,
        u.name as reviewer_name,
        b.booking_date,
        b.service_category_id
       FROM booking_reviews br
       JOIN users u ON br.reviewer_id = u.id
       JOIN bookings b ON br.booking_id = b.id
       WHERE br.reviewee_id = ?
       ORDER BY br.created_at DESC
       LIMIT ? OFFSET ?`,
      [companionId, parseInt(limit), parseInt(offset)]
    );

    // Get rating distribution
    const [ratingDistribution] = await pool.execute(
      `SELECT
        rating,
        COUNT(*) as count
       FROM booking_reviews
       WHERE reviewee_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [companionId]
    );

    // Calculate stats
    const stats = {
      total: totalCount[0].total,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };

    ratingDistribution.forEach(row => {
      stats.distribution[row.rating] = row.count;
    });

    // Transform reviews to camelCase
    const transformedReviews = transformArrayToFrontend(reviews);

    res.status(200).json({
      status: 'success',
      data: {
        reviews: transformedReviews,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount[0].total / limit),
          totalItems: totalCount[0].total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.controllerError('bookingController', 'getCompanionReviews', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Check if a booking has been reviewed
 * @route GET /api/booking/:bookingId/review
 */
const getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const [review] = await pool.execute(
      `SELECT
        br.id,
        br.rating,
        br.review_text,
        br.created_at
       FROM booking_reviews br
       WHERE br.booking_id = ? AND br.reviewer_id = ?`,
      [bookingId, userId]
    );

    if (!review || review.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found',
        hasReviewed: false
      });
    }

    // Transform review to camelCase
    const transformedReview = transformToFrontend(review[0]);

    res.status(200).json({
      status: 'success',
      data: {
        hasReviewed: true,
        review: transformedReview
      }
    });

  } catch (error) {
    logger.controllerError('bookingController', 'getBookingReview', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check review status',
      error: error.message
    });
  }
};

/**
 * Get companion's weekly availability pattern
 * Returns the regular weekly schedule for a companion
 */
const getCompanionWeeklyAvailability = async (req, res) => {
  try {
    const { companionId } = req.params;

    // Get companion's weekly availability pattern
    const [availability] = await pool.execute(
      `SELECT
        day_of_week,
        start_time,
        end_time,
        is_available,
        services
      FROM companion_availability
      WHERE companion_id = ? AND is_available = TRUE
      ORDER BY
        CASE day_of_week
          WHEN 'monday' THEN 1
          WHEN 'tuesday' THEN 2
          WHEN 'wednesday' THEN 3
          WHEN 'thursday' THEN 4
          WHEN 'friday' THEN 5
          WHEN 'saturday' THEN 6
          WHEN 'sunday' THEN 7
        END,
        start_time`,
      [companionId]
    );

    // Group by day for easier frontend consumption
    const weeklyPattern = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    availability.forEach(slot => {
      const services = slot.services ?
        (typeof slot.services === 'string' ? JSON.parse(slot.services) : slot.services) : [];

      weeklyPattern[slot.day_of_week].push({
        startTime: slot.start_time,
        endTime: slot.end_time,
        services: services
      });
    });

    // Calculate summary statistics
    const totalSlotsPerWeek = availability.length;
    const daysAvailable = Object.keys(weeklyPattern).filter(day => weeklyPattern[day].length > 0);

    res.json({
      status: 'success',
      weeklyPattern,
      summary: {
        totalSlotsPerWeek,
        daysAvailable: daysAvailable.length,
        availableDays: daysAvailable
      }
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getCompanionWeeklyAvailability', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch weekly availability',
      error: error.message
    });
  }
};

/**
 * Get companion's availability for a date range
 * Returns available dates and their time slots for calendar display
 */
const getCompanionAvailabilityForDateRange = async (req, res) => {
  try {
    const { companionId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    // Get companion's weekly availability pattern
    const [weeklyAvailability] = await pool.execute(
      `SELECT
        day_of_week,
        start_time,
        end_time,
        services
      FROM companion_availability
      WHERE companion_id = ? AND is_available = TRUE`,
      [companionId]
    );

    // Get existing bookings in the date range
    const [bookings] = await pool.execute(
      `SELECT
        booking_date,
        start_time,
        end_time
      FROM bookings
      WHERE companion_id = ?
        AND booking_date BETWEEN ? AND ?
        AND status IN ('pending', 'confirmed')`,
      [companionId, startDate, endDate]
    );

    // Build availability calendar
    const availabilityCalendar = {};
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Get slots for this day of week
      const daySlotsFromPattern = weeklyAvailability.filter(slot => slot.day_of_week === dayOfWeek);

      // Get bookings for this specific date
      const dateBookings = bookings.filter(booking => booking.booking_date === dateStr);

      // Calculate available slots (slots from pattern minus bookings)
      const availableSlots = [];

      daySlotsFromPattern.forEach(slot => {
        let hasConflict = false;

        for (const booking of dateBookings) {
          const slotStart = new Date(`2000-01-01 ${slot.start_time}`);
          const slotEnd = new Date(`2000-01-01 ${slot.end_time}`);
          const bookingStart = new Date(`2000-01-01 ${booking.start_time}`);
          const bookingEnd = new Date(`2000-01-01 ${booking.end_time}`);

          if (slotStart < bookingEnd && slotEnd > bookingStart) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          const services = slot.services ?
            (typeof slot.services === 'string' ? JSON.parse(slot.services) : slot.services) : [];

          availableSlots.push({
            startTime: slot.start_time,
            endTime: slot.end_time,
            services: services
          });
        }
      });

      availabilityCalendar[dateStr] = {
        dayOfWeek,
        totalSlots: daySlotsFromPattern.length,
        availableSlots: availableSlots.length,
        bookedSlots: dateBookings.length,
        isAvailable: availableSlots.length > 0,
        slots: availableSlots
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      status: 'success',
      availabilityCalendar
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getCompanionAvailabilityForDateRange', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch availability for date range',
      error: error.message
    });
  }
};

/**
 * Create a booking request when no time slots are available
 */
const createBookingRequest = async (req, res) => {
  try {
    const clientId = req.user.id;
    const {
      companionId,
      requestedDate,
      preferredTime,
      startTime,
      endTime,
      durationHours,
      serviceCategoryId,
      serviceType,
      extraAmount,
      meetingType,
      specialRequests,
      meetingLocation
    } = req.body;

    // Validate required fields
    if (!companionId || !requestedDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Companion ID and requested date are required'
      });
    }

    // Prevent self-booking requests
    if (clientId === parseInt(companionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot request a booking with yourself'
      });
    }

    // Check if companion exists and is approved
    const [companions] = await pool.execute(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN companion_applications ca ON u.id = ca.user_id
       JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'companion' AND ur.is_active = TRUE
       WHERE u.id = ? AND ca.status = 'approved'`,
      [companionId]
    );

    if (companions.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Companion not found or not approved'
      });
    }

    // Set expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the booking request
    const [result] = await pool.execute(
      `INSERT INTO booking_requests
       (client_id, companion_id, requested_date, preferred_time, start_time, end_time,
        duration_hours, service_category_id, service_type, extra_amount, meeting_type,
        special_requests, meeting_location, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        clientId,
        companionId,
        requestedDate,
        preferredTime || null,
        startTime || null,
        endTime || null,
        durationHours || 1,
        serviceCategoryId || null,
        serviceType || null,
        extraAmount || 0,
        meetingType || 'in_person',
        specialRequests || null,
        meetingLocation || null,
        expiresAt
      ]
    );

    res.json({
      status: 'success',
      message: 'Booking request created successfully',
      requestId: result.insertId
    });
  } catch (error) {
    logger.controllerError('bookingController', 'createBookingRequest', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking request',
      error: error.message
    });
  }
};

/**
 * Get booking requests for a user (client or companion)
 */
const getBookingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // 'client' or 'companion'
    const { status } = req.query; // Filter by status

    let query;
    let params = [userId];

    if (role === 'companion') {
      query = `
        SELECT
          br.*,
          u.name as client_name,
          u.email as client_email,
          NULL as client_photo,
          sc.name as service_category_name,
          sc.base_price as service_price
        FROM booking_requests br
        JOIN users u ON br.client_id = u.id
        LEFT JOIN service_categories sc ON br.service_category_id = sc.id
        WHERE br.companion_id = ?`;
    } else {
      query = `
        SELECT
          br.*,
          u.name as companion_name,
          u.email as companion_email,
          u.profile_photo_url as companion_photo,
          sc.name as service_category_name,
          sc.base_price as service_price
        FROM booking_requests br
        JOIN users u ON br.companion_id = u.id
        LEFT JOIN service_categories sc ON br.service_category_id = sc.id
        WHERE br.client_id = ?`;
    }

    if (status) {
      query += ' AND br.status = ?';
      params.push(status);
    }

    query += ' ORDER BY br.created_at DESC';

    const [requests] = await pool.execute(query, params);

    res.json({
      status: 'success',
      requests
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getBookingRequests', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking requests',
      error: error.message
    });
  }
};

/**
 * Update booking request status (for companions)
 */
const updateBookingRequestStatus = async (req, res) => {
  try {
    const companionId = req.user.id;
    const { requestId } = req.params;
    const {
      status,
      companionResponse,
      suggestedDate,
      suggestedStartTime,
      suggestedEndTime
    } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be either "accepted" or "rejected"'
      });
    }

    // Check if request exists and belongs to this companion
    const [requests] = await pool.execute(
      'SELECT * FROM booking_requests WHERE id = ? AND companion_id = ?',
      [requestId, companionId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    const request = requests[0];

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update request with status: ${request.status}`
      });
    }

    // If accepting with suggested alternative time
    if (status === 'accepted' && suggestedDate) {
      await pool.execute(
        `UPDATE booking_requests
         SET status = ?,
             companion_response = ?,
             suggested_date = ?,
             suggested_start_time = ?,
             suggested_end_time = ?,
             responded_at = NOW()
         WHERE id = ?`,
        [
          status,
          companionResponse || null,
          suggestedDate,
          suggestedStartTime || null,
          suggestedEndTime || null,
          requestId
        ]
      );
    } else {
      await pool.execute(
        `UPDATE booking_requests
         SET status = ?,
             companion_response = ?,
             responded_at = NOW()
         WHERE id = ?`,
        [status, companionResponse || null, requestId]
      );
    }

    res.json({
      status: 'success',
      message: `Booking request ${status} successfully`
    });
  } catch (error) {
    logger.controllerError('bookingController', 'updateBookingRequestStatus', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking request',
      error: error.message
    });
  }
};

/**
 * Get single booking request details
 */
const getBookingRequestById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const [requests] = await pool.execute(
      `SELECT
        br.*,
        client.name as client_name,
        client.email as client_email,
        client.profile_photo_url as client_photo,
        companion.name as companion_name,
        companion.email as companion_email,
        companion.profile_photo_url as companion_photo,
        sc.name as service_category_name,
        sc.base_price as service_price
      FROM booking_requests br
      JOIN users client ON br.client_id = client.id
      JOIN users companion ON br.companion_id = companion.id
      LEFT JOIN service_categories sc ON br.service_category_id = sc.id
      WHERE br.id = ? AND (br.client_id = ? OR br.companion_id = ?)`,
      [requestId, userId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    res.json({
      status: 'success',
      request: requests[0]
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getBookingRequestById', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking request',
      error: error.message
    });
  }
};

/**
 * Approve a booking request (for companions)
 */
const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const companionId = req.user.id;

    // Verify the booking exists and belongs to this companion
    const [bookings] = await pool.execute(
      `SELECT b.*, c.email as client_email, c.name as client_name
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       WHERE b.id = ? AND b.companion_id = ? AND b.status = 'pending'`,
      [bookingId, companionId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or already processed'
      });
    }

    const booking = bookings[0];

    // Check for conflicting approved bookings
    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings
       WHERE companion_id = ? AND booking_date = ?
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
       AND status = 'confirmed' AND id != ?`,
      [companionId, booking.booking_date, booking.start_time, booking.start_time,
       booking.end_time, booking.end_time, bookingId]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This time slot has already been confirmed for another booking'
      });
    }

    // Update booking status to confirmed
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['confirmed', bookingId]
    );

    // Send confirmation email to client
    if (booking.client_email) {
      await sendBookingNotificationEmail(
        booking.client_email,
        'Booking Confirmed!',
        `Your booking with ${req.user.name} has been confirmed for ${booking.booking_date}.`
      );
    }

    // Automatically reject other pending bookings for the same time slot
    await pool.execute(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE companion_id = ? AND booking_date = ?
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
       AND status = 'pending' AND id != ?`,
      [companionId, booking.booking_date, booking.start_time, booking.start_time,
       booking.end_time, booking.end_time, bookingId]
    );

    res.json({
      status: 'success',
      message: 'Booking approved successfully'
    });
  } catch (error) {
    logger.controllerError('bookingController', 'approveBooking', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve booking',
      error: error.message
    });
  }
};

/**
 * Reject a booking request (for companions)
 */
const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const companionId = req.user.id;
    const { reason } = req.body;

    // Verify the booking exists and belongs to this companion
    const [bookings] = await pool.execute(
      `SELECT b.*, c.email as client_email, c.name as client_name
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       WHERE b.id = ? AND b.companion_id = ? AND b.status = 'pending'`,
      [bookingId, companionId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or already processed'
      });
    }

    const booking = bookings[0];

    // Update booking status to cancelled
    await pool.execute(
      'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', bookingId]
    );

    // Send rejection email to client
    if (booking.client_email) {
      const message = reason
        ? `Your booking request has been declined. Reason: ${reason}`
        : 'Your booking request has been declined by the companion.';

      await sendBookingNotificationEmail(
        booking.client_email,
        'Booking Request Declined',
        message
      );
    }

    res.json({
      status: 'success',
      message: 'Booking rejected successfully'
    });
  } catch (error) {
    logger.controllerError('bookingController', 'rejectBooking', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject booking',
      error: error.message
    });
  }
};

/**
 * Get pending bookings for companion approval
 */
const getPendingBookingsForCompanion = async (req, res) => {
  try {
    const companionId = req.user.id;

    const [bookings] = await pool.execute(
      `SELECT b.*,
              c.name as client_name,
              c.email as client_email,
              sc.name as service_category_name
       FROM bookings b
       JOIN users c ON b.client_id = c.id
       LEFT JOIN service_categories sc ON b.service_category_id = sc.id
       WHERE b.companion_id = ? AND b.status = 'pending'
       ORDER BY b.created_at DESC`,
      [companionId]
    );

    // Transform bookings to camelCase for frontend consistency
    const transformedBookings = transformArrayToFrontend(bookings);

    res.json({
      status: 'success',
      data: transformedBookings
    });
  } catch (error) {
    logger.controllerError('bookingController', 'getPendingBookingsForCompanion', error, req);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending bookings',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getCompanionAvailability,
  setCompanionAvailability,
  getAvailableTimeSlots,
  getCompanionBookingsByDateRange,
  createReview,
  getCompanionReviews,
  getBookingReview,
  getCompanionWeeklyAvailability,
  getCompanionAvailabilityForDateRange,
  createBookingRequest,
  getBookingRequests,
  updateBookingRequestStatus,
  getBookingRequestById,
  approveBooking,
  rejectBooking,
  getPendingBookingsForCompanion
};