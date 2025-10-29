var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Check if user is logged in by checking session
  const user = req.session && req.session.userId ? {
    id: req.session.userId,
    name: req.session.username,
    role: req.session.role
  } : null;

  res.render('home_layout', { 
    title: 'Home',
    user: user
  });
});

module.exports = router;
