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
    const [usersCount] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients,
        SUM(CASE WHEN role = 'companion' THEN 1 ELSE 0 END) as companions
      FROM users`
    );

    // Get pending applications count
    const [pendingApps] = await pool.query(
      `SELECT COUNT(*) as count FROM companion_applications WHERE status = 'pending'`
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

    const [applications] = await pool.query(query, params);

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
    const [applications] = await pool.query(
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
    await pool.query(
      `UPDATE companion_applications 
       SET status = 'approved', reviewed_at = NOW() 
       WHERE id = ?`,
      [applicationId]
    );

    // Update user role to companion
    await pool.query(
      `UPDATE users SET role = 'companion' WHERE id = ?`,
      [userId]
    );

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
    const [applications] = await pool.query(
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
    await pool.query(
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

    const [users] = await pool.query(query, params);

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
    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [userId]);

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
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

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

module.exports = {
  getDashboardStats,
  getApplications,
  approveApplication,
  rejectApplication,
  getUsers,
  deleteUser
};






















