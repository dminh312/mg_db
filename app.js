var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');


mongoose.connect('mongodb://localhost:27017/web', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/category');
var productRouter = require('./routes/product');
var homeRouter = require('./routes/home');
var apiRouter = require('./routes/api');
var authMiddleware = require('./middleware/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: 'replace-this-with-a-strong-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));




app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter);
// RESTful API routes
app.use('/api', apiRouter);
// protect category and product routes so only logged-in users can access
app.use('/category', authMiddleware.ensureAuthenticated, categoryRouter);
app.use('/product', authMiddleware.ensureAuthenticated, productRouter);

// catch 404 and forward to error handler
// catch 404 and render a friendly 404 page
app.use(function(req, res, next) {
  res.status(404);
  return res.render('error', { message: 'Not Found: ' + req.originalUrl, error: {} });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000);
module.exports = app;