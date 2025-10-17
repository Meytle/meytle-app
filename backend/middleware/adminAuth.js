/**
 * Admin Authentication Middleware
 * Verifies that the user is an admin before allowing access
 */

const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (handled by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      console.log(`❌ Unauthorized admin access attempt by user ${req.user.id} (role: ${req.user.role})`);
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log(`✅ Admin access granted to user ${req.user.id}`);
    next();
  } catch (error) {
    console.error('❌ Admin auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during authorization'
    });
  }
};

module.exports = adminAuth;






















