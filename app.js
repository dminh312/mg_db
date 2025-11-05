require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var cors = require('cors');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected to:', MONGODB_URI.includes('mongodb+srv') ? 'Atlas Cloud' : 'Localhost'))
  .catch(err => console.error('MongoDB connection error:', err));

var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'replace-this-with-a-strong-secret',
  resave: false,
  saveUninitialized: false,
  name: 'dangcap.sid',
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

console.log('🔧 Session config:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  environment: process.env.NODE_ENV || 'development'
});

app.use(session(sessionConfig));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Dang Cap Market API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/login',
      register: '/api/register',
      categories: '/api/categories',
      products: '/api/products',
      users: '/api/users'
    }
  });
});

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175',
  'https://mg-db.vercel.app',
  'https://mg-db-git-main-dminh312s-projects.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
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

app.use(function(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Not Found: ' + req.originalUrl,
    error: 'Endpoint does not exist'
  });
});

app.use(function(err, req, res, next) {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: req.app.get('env') === 'development' ? err.stack : 'An error occurred'
  });
});

module.exports = app;