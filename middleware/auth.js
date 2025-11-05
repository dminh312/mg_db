// middleware/auth.js
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req && req.session && req.session.userId) {
      return next();
    }
    // remember original URL to return after login
    if (req && req.session) req.session.returnTo = req.originalUrl || '/';
    return res.redirect('/users/login');
  },
  
  ensureAdmin: function (req, res, next) {
    if (req && req.session && req.session.userId) {
      if (req.session.role === 'admin') {
        return next();
      }
      // User is authenticated but not admin
      return res.status(403).render('error', { 
        message: 'Access Denied', 
        error: { status: 403, stack: 'You do not have permission to access this resource.' }
      });
    }
    // Not authenticated at all
    if (req && req.session) req.session.returnTo = req.originalUrl || '/';
    return res.redirect('/users/login');
  },

  // API-specific middleware - returns JSON instead of redirecting
  ensureAuthenticatedAPI: function (req, res, next) {
    if (req && req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  },

  ensureAdminAPI: function (req, res, next) {
    console.log('🔒 Auth check - Session:', {
      userId: req.session?.userId,
      username: req.session?.username,
      role: req.session?.role,
      sessionID: req.sessionID,
      cookies: req.cookies,
      hasSession: !!req.session
    });

    if (!req.session || !req.session.userId) {
      console.log('❌ No session found - Authentication required');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
        debug: {
          hasSession: !!req.session,
          hasUserId: !!req.session?.userId,
          sessionID: req.sessionID
        }
      });
    }

    if (req.session.role !== 'admin') {
      console.log('❌ User is not admin:', req.session.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have permission.',
        debug: {
          currentRole: req.session.role,
          requiredRole: 'admin'
        }
      });
    }

    console.log('✅ Admin access granted for:', req.session.username);
    return next();
  }
};
