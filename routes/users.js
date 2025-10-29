const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get("/login", function(req, res) {
  res.render("users/login");
});

// POST /users/login (router is mounted at /users)
router.post("/login", async function(req, res) {
  console.log("Login attempt:", req.body && req.body.username);
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username: username });
    console.log("User found:", user);
    

    if (!user) {
      return res.render("users/login", { error: "Invalid username or password." });
    }

    // Compare provided password with hashed password in DB
    // Check if password is hashed (starts with $2b$ for bcrypt) or plain text
    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Password is hashed, use bcrypt
      match = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (for testing), direct comparison
      match = (password === user.password);
    }
    
    console.log("Provided password:", match);
    console.log("userID ", user.username);
    if (!match) {
      return res.render("users/login", { error: "Invalid username or password." });
    }

  // Set user session (defensive: ensure session exists)
  if (!req.session) req.session = {};
  req.session.userId = user._id;
  req.session.username = user.username;
  req.session.role = user.role || 'user'; // Store user role, default to 'user'

    // If user tried to access a protected page, redirect back there
    const redirectTo = (req.session && req.session.returnTo) ? req.session.returnTo : '/';
    if (req.session && req.session.returnTo) delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (err) {
    console.error("Login error:", err);
    res.render("users/login", { error: "An error occurred. Please try again." });
  }
});

router.get("/register", function(req, res) {
  res.render("users/register");
});

// POST /users/register
router.post("/register", async function(req, res) {
  // Accept either username or name/email from the registration form
  const username = req.body.username || req.body.name || req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Basic server-side validation
  if (!username || !password) {
    return res.render("users/register", { error: "Username and password are required.", name: req.body.name, email: req.body.email });
  }

  if (typeof password2 !== 'undefined' && password !== password2) {
    return res.render("users/register", { error: "Passwords do not match.", name: req.body.name, email: req.body.email });
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ username: username });
    if (existingUser) {
      return res.render("users/register", { error: "Username already taken.", name: req.body.name, email: req.body.email });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      username: username,
      password: hashedPassword
    });
    await newUser.save();
    console.log("User registered:", newUser.username);

    res.redirect("/users/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.render("users/register", { error: "An error occurred. Please try again.", name: req.body.name, email: req.body.email });
  }
});

// Logout route
router.get("/logout", function(req, res) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect('/');
      }
      res.redirect('/users/login');
    });
  } else {
    res.redirect('/users/login');
  }
});

module.exports = router;
