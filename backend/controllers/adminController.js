/**
 * Admin Controller
 * Handles admin operations for managing applications and users
 */

const { pool } = require('../config/database');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const [usersCount] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients,
        SUM(CASE WHEN role = 'companion' THEN 1 ELSE 0 END) as companions
      FROM users`
    );

    // Get pending applications count
    const [pendingApps] = await pool.execute(
      `SELECT COUNT(*) as count FROM companion_applications WHERE status = 'pending'`
    );

    // Get pending client verifications count
    const [pendingClientVerifs] = await pool.execute(
      `SELECT COUNT(*) as count FROM client_verifications WHERE verification_status = 'pending'`
    );

    // Get total bookings (placeholder - implement when bookings table exists)
    const totalBookings = 0;
    const avgRating = 4.5;

    // Get total earnings (placeholder - implement when payments table exists)
    const totalEarnings = 0;

    res.json({
      status: 'success',
      data: {
        users: {
          total: usersCount[0].total,
          clients: usersCount[0].clients,
          companions: usersCount[0].companions
        },
        pendingApplications: pendingApps[0].count,
        pendingClientVerifications: pendingClientVerifs[0].count,
        bookings: {
          total: totalBookings,
          avgRating: avgRating
        },
        earnings: {
          total: totalEarnings,
          commission: 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * Get all companion applications (with filters)
 */
const getApplications = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        ca.*,
        u.name,
        u.email
      FROM companion_applications ca
      JOIN users u ON ca.user_id = u.id
    `;

    const params = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ' WHERE ca.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ca.created_at DESC';

    const [applications] = await pool.execute(query, params);

    res.json({
      status: 'success',
      data: applications
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch applications'
    });
  }
};

/**
 * Approve companion application
 */
const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Get application details
    const [applications] = await pool.execute(
      'SELECT user_id FROM companion_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    const userId = applications[0].user_id;

    // Update application status
    await pool.execute(
      `UPDATE companion_applications
       SET status = 'approved', reviewed_at = NOW()
       WHERE id = ?`,
      [applicationId]
    );

    // Update user role to companion in users table
    await pool.execute(
      `UPDATE users SET role = 'companion' WHERE id = ?`,
      [userId]
    );

    // Check if companion role exists in user_roles table
    const [existingRole] = await pool.execute(
      'SELECT * FROM user_roles WHERE user_id = ? AND role = ?',
      [userId, 'companion']
    );

    if (existingRole.length === 0) {
      // Add companion role to user_roles table
      await pool.execute(
        'INSERT INTO user_roles (user_id, role, is_active) VALUES (?, ?, TRUE)',
        [userId, 'companion']
      );
      console.log(`✅ Added companion role to user_roles for user ${userId}`);
    } else {
      // Ensure the companion role is active
      await pool.execute(
        'UPDATE user_roles SET is_active = TRUE WHERE user_id = ? AND role = ?',
        [userId, 'companion']
      );
      console.log(`✅ Activated companion role for user ${userId}`);
    }

    console.log(`✅ Application ${applicationId} approved for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Application approved successfully'
    });
  } catch (error) {
    console.error('❌ Error approving application:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve application'
    });
  }
};

/**
 * Reject companion application
 */
const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    // Check if application exists
    const [applications] = await pool.execute(
      'SELECT id FROM companion_applications WHERE id = ?',
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Update application status
    await pool.execute(
      `UPDATE companion_applications 
       SET status = 'rejected', rejection_reason = ?, reviewed_at = NOW() 
       WHERE id = ?`,
      [reason || 'Application rejected by admin', applicationId]
    );

    console.log(`✅ Application ${applicationId} rejected`);

    res.json({
      status: 'success',
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('❌ Error rejecting application:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject application'
    });
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, email, role, created_at FROM users';
    const params = [];

    if (role && ['client', 'companion', 'admin'].includes(role)) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.execute(query, params);

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (users[0].role === 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete admin users'
      });
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    console.log(`✅ User ${userId} deleted successfully`);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

/**
 * Check data integrity for companion availability
 * Admin-only endpoint to verify no data cross-contamination
 */
const checkAvailabilityIntegrity = async (req, res) => {
  try {
    console.log('🔍 Admin checking availability data integrity');

    // Call the stored procedure to check integrity
    const [results] = await pool.execute('CALL check_availability_integrity()');

    // Format the results
    const integrityReport = {
      orphanedRecords: results[0] || [],
      invalidRoles: results[1] || [],
      duplicateSlots: results[2] || [],
      overlappingSlots: results[3] || []
    };

    // Check if any issues were found
    const hasIssues = Object.values(integrityReport).some(
      issues => issues.length > 0 && issues[0].issue_count > 0
    );

    res.json({
      status: 'success',
      data: {
        hasIssues,
        report: integrityReport,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Data integrity check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check data integrity',
      error: error.message
    });
  }
};

/**
 * Get availability audit logs
 * Admin-only endpoint to view all availability changes
 */
const getAvailabilityAuditLogs = async (req, res) => {
  try {
    const { companionId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        aal.*,
        u1.name as companion_name,
        u1.email as companion_email,
        u2.name as changed_by_name,
        u2.email as changed_by_email
      FROM availability_audit_log aal
      LEFT JOIN users u1 ON aal.companion_id = u1.id
      LEFT JOIN users u2 ON aal.changed_by_id = u2.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (companionId) {
      query += ' AND aal.companion_id = ?';
      queryParams.push(companionId);
    }

    if (startDate) {
      query += ' AND aal.changed_at >= ?';
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ' AND aal.changed_at <= ?';
      queryParams.push(endDate);
    }

    query += ' ORDER BY aal.changed_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM availability_audit_log aal
      WHERE 1=1
    `;
    const countParams = [];

    if (companionId) {
      countQuery += ' AND aal.companion_id = ?';
      countParams.push(companionId);
    }

    if (startDate) {
      countQuery += ' AND aal.changed_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND aal.changed_at <= ?';
      countParams.push(endDate);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      status: 'success',
      data: {
        logs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

/**
 * Clean up invalid availability data
 * Admin-only endpoint to fix data issues
 */
const cleanupAvailabilityData = async (req, res) => {
  try {
    const { dryRun = true } = req.body;

    console.log(`🧹 Starting availability data cleanup (dry run: ${dryRun})`);

    const issues = [];

    // 1. Find and remove orphaned records
    const [orphaned] = await pool.execute(`
      SELECT ca.*
      FROM companion_availability ca
      LEFT JOIN users u ON ca.companion_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphaned.length > 0) {
      issues.push({
        type: 'orphaned',
        count: orphaned.length,
        records: orphaned
      });

      if (!dryRun) {
        await pool.execute(`
          DELETE ca FROM companion_availability ca
          LEFT JOIN users u ON ca.companion_id = u.id
          WHERE u.id IS NULL
        `);
      }
    }

    // 2. Find and remove availability for non-companions
    const [invalidRole] = await pool.execute(`
      SELECT ca.*
      FROM companion_availability ca
      LEFT JOIN user_roles ur ON ca.companion_id = ur.user_id AND ur.role = 'companion'
      WHERE ur.user_id IS NULL
    `);

    if (invalidRole.length > 0) {
      issues.push({
        type: 'invalid_role',
        count: invalidRole.length,
        records: invalidRole
      });

      if (!dryRun) {
        await pool.execute(`
          DELETE ca FROM companion_availability ca
          LEFT JOIN user_roles ur ON ca.companion_id = ur.user_id AND ur.role = 'companion'
          WHERE ur.user_id IS NULL
        `);
      }
    }

    // 3. Remove duplicate slots (keep the most recent)
    const [duplicates] = await pool.execute(`
      SELECT companion_id, day_of_week, start_time, COUNT(*) as cnt
      FROM companion_availability
      GROUP BY companion_id, day_of_week, start_time
      HAVING cnt > 1
    `);

    if (duplicates.length > 0) {
      issues.push({
        type: 'duplicates',
        count: duplicates.length,
        records: duplicates
      });

      if (!dryRun) {
        for (const dup of duplicates) {
          // Keep only the most recent one
          await pool.execute(`
            DELETE FROM companion_availability
            WHERE companion_id = ? AND day_of_week = ? AND start_time = ?
            AND id NOT IN (
              SELECT id FROM (
                SELECT MAX(id) as id
                FROM companion_availability
                WHERE companion_id = ? AND day_of_week = ? AND start_time = ?
              ) as keeper
            )
          `, [dup.companion_id, dup.day_of_week, dup.start_time,
              dup.companion_id, dup.day_of_week, dup.start_time]);
        }
      }
    }

    const cleanupResult = {
      dryRun,
      issuesFound: issues.length > 0,
      issues,
      message: dryRun
        ? 'Dry run completed. No data was modified.'
        : 'Cleanup completed. Invalid data has been removed.'
    };

    // Log the cleanup action
    if (!dryRun && issues.length > 0) {
      await pool.execute(
        `INSERT INTO availability_audit_log
         (companion_id, action, old_data, new_data, changed_by_id, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          0, // System action
          'ADMIN_CLEANUP',
          JSON.stringify(issues),
          null,
          req.user.id,
          req.ip || req.connection.remoteAddress,
          'Admin Dashboard'
        ]
      );
    }

    res.json({
      status: 'success',
      data: cleanupResult
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cleanup availability data',
      error: error.message
    });
  }
};

/**
 * Get client verifications for admin review
 */
const getClientVerifications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const query = `
      SELECT
        cv.id,
        cv.user_id,
        cv.profile_photo_url,
        cv.id_document_url,
        cv.date_of_birth,
        cv.government_id_number,
        cv.phone_number,
        cv.location,
        cv.address_line,
        cv.city,
        cv.state,
        cv.country,
        cv.postal_code,
        cv.bio,
        cv.verification_status,
        cv.rejection_reason,
        cv.created_at,
        cv.verified_at,
        cv.reviewed_at,
        u.name,
        u.email
      FROM client_verifications cv
      INNER JOIN users u ON cv.user_id = u.id
      WHERE cv.verification_status = ?
      ORDER BY cv.created_at ASC
    `;

    const [verifications] = await pool.execute(query, [status]);

    res.json({
      status: 'success',
      data: verifications
    });
  } catch (error) {
    console.error('Error fetching client verifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch client verifications',
      error: error.message
    });
  }
};

/**
 * Approve client verification
 */
const approveClientVerification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if verification exists
    const [verification] = await pool.execute(
      'SELECT * FROM client_verifications WHERE id = ?',
      [id]
    );

    if (verification.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Client verification not found'
      });
    }

    // Update verification status
    await pool.execute(
      `UPDATE client_verifications
       SET verification_status = 'approved',
           verified_at = CURRENT_TIMESTAMP,
           reviewed_at = CURRENT_TIMESTAMP,
           rejection_reason = NULL
       WHERE id = ?`,
      [id]
    );

    console.log(`✅ Client verification ${id} approved by admin ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Client verification approved successfully'
    });
  } catch (error) {
    console.error('Error approving client verification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve client verification',
      error: error.message
    });
  }
};

/**
 * Reject client verification
 */
const rejectClientVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    // Check if verification exists
    const [verification] = await pool.execute(
      'SELECT * FROM client_verifications WHERE id = ?',
      [id]
    );

    if (verification.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Client verification not found'
      });
    }

    // Update verification status
    await pool.execute(
      `UPDATE client_verifications
       SET verification_status = 'rejected',
           reviewed_at = CURRENT_TIMESTAMP,
           rejection_reason = ?
       WHERE id = ?`,
      [reason, id]
    );

    console.log(`❌ Client verification ${id} rejected by admin ${req.user.id}. Reason: ${reason}`);

    res.json({
      status: 'success',
      message: 'Client verification rejected'
    });
  } catch (error) {
    console.error('Error rejecting client verification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject client verification',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getApplications,
  approveApplication,
  rejectApplication,
  getUsers,
  deleteUser,
  checkAvailabilityIntegrity,
  getAvailabilityAuditLogs,
  cleanupAvailabilityData,
  getClientVerifications,
  approveClientVerification,
  rejectClientVerification
};






















