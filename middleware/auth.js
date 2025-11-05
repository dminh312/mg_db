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
      return res.status(403).json({
        success: false,
        message: 'Access Denied'
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
        console.log('🔒 JWT Auth:', decoded.username, decoded.role);
        if (decoded.role !== 'admin') {
          console.log('❌ Not admin:', decoded.role);
          return res.status(403).json({
            success: false,
            message: 'Admin access required.'
          });
        }
        req.user = decoded;
        console.log('✅ Admin access granted:', decoded.username);
        return next();
      } catch (err) {
        console.log('❌ JWT verification failed:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token. Please login again.'
        });
      }
    }
    
    console.log('🔒 Session Auth:', req.session?.username, req.session?.role);
    if (!req.session || !req.session.userId) {
      console.log('❌ No session');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    if (req.session.role !== 'admin') {
      console.log('❌ Not admin:', req.session.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access required.'
      });
    }
    console.log('✅ Admin access granted:', req.session.username);
    return next();
  }
};
