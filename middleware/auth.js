// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req && req.session && req.session.userId) {
      return next();
    }
    if (req && req.session) req.session.returnTo = req.originalUrl || '/';
    return res.redirect('/users/login');
  },
  
  ensureAdmin: function (req, res, next) {
    if (req && req.session && req.session.userId) {
      if (req.session.role === 'admin') {
        return next();
      }
      return res.status(403).render('error', { 
        message: 'Access Denied', 
        error: { status: 403, stack: 'You do not have permission to access this resource.' }
      });
    }
    if (req && req.session) req.session.returnTo = req.originalUrl || '/';
    return res.redirect('/users/login');
  },

  ensureAuthenticatedAPI: function (req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        console.log('❌ Invalid JWT token:', err.message);
      }
    }
    if (req && req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  },

  ensureAdminAPI: function (req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('🔒 JWT Auth check:', decoded);
        if (decoded.role !== 'admin') {
          console.log('❌ User is not admin:', decoded.role);
          return res.status(403).json({
            success: false,
            message: 'Admin access required. You do not have permission.'
          });
        }
        req.user = decoded;
        console.log('✅ Admin access granted via JWT for:', decoded.username);
        return next();
      } catch (err) {
        console.log('❌ JWT verification failed:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token. Please login again.'
        });
      }
    }
    console.log('🔒 Session Auth check:', {
      userId: req.session?.userId,
      role: req.session?.role
    });
    if (!req.session || !req.session.userId) {
      console.log('❌ No session found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    if (req.session.role !== 'admin') {
      console.log('❌ User is not admin:', req.session.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have permission.'
      });
    }
    console.log('✅ Admin access granted via session for:', req.session.username);
    return next();
  }
};
