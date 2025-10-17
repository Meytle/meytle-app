/**
 * Booking Controller
 * Handles booking creation, management, and availability
 */

const { pool } = require('../config/database');
const { BOOKING_CONSTANTS, PAYMENT_CONSTANTS } = require('../constants');

/**
 * Create a new booking
 */
const createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { companionId, bookingDate, startTime, endTime, specialRequests, meetingLocation, serviceCategoryId, meetingType } = req.body;

    // Validate required fields
    if (!companionId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: companionId, bookingDate, startTime, endTime'
      });
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
      return res.status(400).json({
        status: 'error',
        message: 'Booking date and time must be in the future'
      });
    }

    // Check if companion exists and is approved
    const [companions] = await pool.query(
      `SELECT u.id, u.name, ca.status 
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

    // Validate and fetch service category if provided
    let categoryBasePrice = null;
    if (serviceCategoryId) {
      const [categories] = await pool.query(
        'SELECT id, base_price FROM service_categories WHERE id = ? AND is_active = TRUE',
        [serviceCategoryId]
      );

      if (categories.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Service category not found or inactive'
        });
      }

      categoryBasePrice = categories[0].base_price;
    }

    // Validate meetingType if provided
    if (meetingType && !['in_person', 'virtual'].includes(meetingType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid meeting type. Must be in_person or virtual'
      });
    }

    // Check for conflicting bookings
    const [conflictingBookings] = await pool.query(
      `SELECT id FROM bookings 
       WHERE companion_id = ? AND booking_date = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?)) 
       AND status IN ('pending', 'confirmed')`,
      [companionId, bookingDate, startTime, startTime, endTime, endTime]
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Time slot is already booked'
      });
    }

    // Validate endTime > startTime
    const start = new Date(`${bookingDate} ${startTime}`);
    const end = new Date(`${bookingDate} ${endTime}`);
    
    if (end <= start) {
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time'
      });
    }

    // Calculate duration and amount
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    // Validate duration is reasonable (at least 1 hour, max 12 hours)
    if (durationHours < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking duration must be at least 1 hour'
      });
    }
    
    if (durationHours > 12) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking duration cannot exceed 12 hours'
      });
    }
    
    // Use category base price if available, otherwise default to $35/hour
    const hourlyRate = categoryBasePrice || 35;
    const subtotal = Math.round(durationHours * hourlyRate * 100) / 100; // Round to 2 decimal places
    const serviceFee = Math.round(subtotal * BOOKING_CONSTANTS.SERVICE_FEE_PERCENTAGE * 100) / 100; // Service fee
    const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100; // Total including service fee

    // Create booking
    const [result] = await pool.query(
      `INSERT INTO bookings 
       (client_id, companion_id, booking_date, start_time, end_time, duration_hours, total_amount, special_requests, meeting_location, service_category_id, meeting_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, companionId, bookingDate, startTime, endTime, durationHours, totalAmount, specialRequests, meetingLocation, serviceCategoryId || null, meetingType || 'in_person']
    );

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: {
        bookingId: result.insertId,
        totalAmount,
        durationHours
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

/**
 * Get bookings for a user (client or companion)
 */
const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = `
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
        b.payment_status,
        b.payment_method,
        b.payment_intent_id,
        b.paid_at,
        b.created_at,
        b.service_category_id,
        sc.name as service_category_name,
        sc.base_price as service_category_price,
        ${userRole === 'client' ? `
          u.name as companion_name,
          u.email as companion_email,
          ca.profile_photo_url as companion_photo
        ` : `
          u.name as client_name,
          u.email as client_email
        `}
      FROM bookings b
      JOIN users u ON ${userRole === 'client' ? 'b.companion_id' : 'b.client_id'} = u.id
      ${userRole === 'client' ? 'LEFT JOIN companion_applications ca ON u.id = ca.user_id' : ''}
      LEFT JOIN service_categories sc ON b.service_category_id = sc.id
      WHERE ${userRole === 'client' ? 'b.client_id' : 'b.companion_id'} = ?
    `;

    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await pool.query(query, params);

    // Cast service_category_price to number for each booking
    const bookingsWithNumericPrice = bookings.map(booking => ({
      ...booking,
      service_category_price: booking.service_category_price !== null ? Number(booking.service_category_price) : null
    }));

    res.json({
      status: 'success',
      data: bookingsWithNumericPrice
    });
  } catch (error) {
    console.error('Get bookings error:', error);
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

    const [bookings] = await pool.query(
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
        b.payment_status,
        b.payment_method,
        b.payment_intent_id,
        b.paid_at,
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
    
    // Cast service_category_price to number
    if (booking.service_category_price !== null) {
      booking.service_category_price = Number(booking.service_category_price);
    }

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
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

    // Check if user has permission to update this booking
    const [bookings] = await pool.query(
      `SELECT id, status FROM bookings 
       WHERE id = ? AND (client_id = ? OR companion_id = ?)`,
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or access denied'
      });
    }

    // Update booking status
    const [result] = await pool.query(
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
    console.error('Update booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

/**
 * Update payment status for a booking
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { payment_status, payment_method, payment_intent_id } = req.body;
    const userId = req.user.id;

    // Normalize snake_case to camelCase for internal use
    const paymentStatus = payment_status;
    const paymentMethod = payment_method;
    const paymentIntentId = payment_intent_id;

    // Validate payment status
    if (!PAYMENT_CONSTANTS.VALID_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment status. Must be one of: ' + PAYMENT_CONSTANTS.VALID_STATUSES.join(', ')
      });
    }

    // Check if user has permission to update this booking
    const [bookings] = await pool.query(
      `SELECT id FROM bookings 
       WHERE id = ? AND (client_id = ? OR companion_id = ?)`,
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or access denied'
      });
    }

    // Set paid_at timestamp if payment status is 'paid'
    const paidAt = paymentStatus === 'paid' ? new Date() : null;

    // Update payment status
    const [result] = await pool.query(
      `UPDATE bookings 
       SET payment_status = ?, payment_method = ?, payment_intent_id = ?, paid_at = ? 
       WHERE id = ?`,
      [paymentStatus, paymentMethod || null, paymentIntentId || null, paidAt, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Payment status updated successfully',
      data: {
        paymentStatus,
        paymentMethod,
        paymentIntentId,
        paidAt
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

/**
 * Get companion availability
 */
const getCompanionAvailability = async (req, res) => {
  try {
    const { companionId } = req.params;
    const { date } = req.query;

    let query = `
      SELECT 
        day_of_week,
        start_time,
        end_time,
        is_available
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

    const [availability] = await pool.query(query, params);

    res.json({
      status: 'success',
      data: availability
    });
  } catch (error) {
    console.error('Get companion availability error:', error);
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

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        status: 'error',
        message: 'Availability must be an array'
      });
    }

    // Clear existing availability
    await pool.query('DELETE FROM companion_availability WHERE companion_id = ?', [companionId]);

    // Insert new availability
    for (const slot of availability) {
      const { dayOfWeek, startTime, endTime, isAvailable = true } = slot;
      
      if (!dayOfWeek || !startTime || !endTime) {
        continue; // Skip invalid entries
      }

      await pool.query(
        `INSERT INTO companion_availability 
         (companion_id, day_of_week, start_time, end_time, is_available) 
         VALUES (?, ?, ?, ?, ?)`,
        [companionId, dayOfWeek, startTime, endTime, isAvailable]
      );
    }

    res.json({
      status: 'success',
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Set companion availability error:', error);
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
    const [availability] = await pool.query(
      `SELECT start_time, end_time, is_available 
       FROM companion_availability 
       WHERE companion_id = ? AND day_of_week = ? AND is_available = TRUE
       ORDER BY start_time`,
      [companionId, dayOfWeek]
    );

    // Get existing bookings for this date
    const [bookings] = await pool.query(
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
    console.error('Get available time slots error:', error);
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
    const [bookings] = await pool.query(
      `SELECT id, booking_date, start_time, end_time, status
       FROM bookings 
       WHERE companion_id = ? AND booking_date BETWEEN ? AND ?
       AND status IN ('pending', 'confirmed')
       ORDER BY booking_date ASC, start_time ASC`,
      [companionId, startDate, endDate]
    );

    res.json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    console.error('Get companion bookings by date range error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companion bookings',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  getCompanionAvailability,
  setCompanionAvailability,
  getAvailableTimeSlots,
  getCompanionBookingsByDateRange
};

