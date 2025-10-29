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
  }
};
