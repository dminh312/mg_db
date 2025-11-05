// Load environment variables
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var cors = require('cors');

// Use environment variable for MongoDB connection or fallback to localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected to:', MONGODB_URI.includes('mongodb+srv') ? 'Atlas Cloud' : 'Localhost'))
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

// Session middleware - configured for production compatibility
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'replace-this-with-a-strong-secret',
  resave: false,
  saveUninitialized: false,
  name: 'dangcap.sid', // Custom cookie name
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies in production
  }
};

// Log session configuration
console.log('🔧 Session config:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  environment: process.env.NODE_ENV || 'development'
});

app.use(session(sessionConfig));




// Web routes (disabled in production - frontend handles UI)
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/home', homeRouter);

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dang Cap Market API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products'
    }
  });
});

// RESTful API routes - enable CORS for cross-origin API requests
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175',
  'https://mg-db.vercel.app',
  'https://mg-db-git-main-dminh312s-projects.vercel.app',
  process.env.CORS_ORIGIN // Additional Vercel frontend URL from env
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches vercel.app domain
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use('/api', cors(corsOptions), apiRouter);

// Server-rendered routes (disabled - Vue.js frontend handles these)
// app.use('/category', authMiddleware.ensureAuthenticated, categoryRouter);
// app.use('/product', authMiddleware.ensureAuthenticated, productRouter);

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

module.exports = app;