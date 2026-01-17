/**
 * Admin Authentication Middleware
 * Ensures only users with admin role can access admin routes
 */

console.log('🔧 Admin middleware file loaded');

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  console.log('🔐 ensureAuthenticated called for:', req.path);
  if (req.isAuthenticated()) {
    console.log('✅ User is authenticated:', req.user?.email);
    return next();
  }
  
  console.log('❌ User not authenticated for:', req.path);
  
  // For API routes, return JSON error
  if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  // For page routes, redirect to signin
  res.redirect('/signin?error=auth_required&message=' + encodeURIComponent('Please login to access this page'));
}

// Middleware to ensure user has admin role
function ensureAdmin(req, res, next) {
  console.log('🔧 ensureAdmin called for:', req.path);
  console.log('🔧 User authenticated:', req.isAuthenticated());
  console.log('🔧 User object:', req.user ? { email: req.user.email, role: req.user.role } : 'No user');
  
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    console.log('❌ Admin access denied: User not authenticated');
    
    // For API routes, return JSON error
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // For page routes, redirect to signin
    return res.redirect('/signin?error=auth_required&message=' + encodeURIComponent('Please login to access admin panel'));
  }

  // Check if user has admin role
  if (!req.user || req.user.role !== 'admin') {
    console.log('❌ Admin access denied:', {
      userId: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      requestedPath: req.path
    });
    
    // For API routes, return JSON error
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required. You do not have permission to access this resource.' 
      });
    }
    
    // For page routes, show 404 to hide admin existence
    return res.status(404).render('error', {
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist.',
      error: { status: 404 }
    });
  }

  console.log('✅ Admin access granted:', {
    userId: req.user._id,
    userEmail: req.user.email,
    userRole: req.user.role,
    requestedPath: req.path
  });

  next();
}

// Middleware to check if user is admin (for conditional rendering)
function checkAdminRole(req, res, next) {
  res.locals.isAdmin = req.isAuthenticated() && req.user && req.user.role === 'admin';
  res.locals.userRole = req.isAuthenticated() && req.user ? req.user.role : 'guest';
  next();
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  checkAdminRole
};