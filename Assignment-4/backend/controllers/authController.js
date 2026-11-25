const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { appEvents } = require('../events/eventHandler');

// @desc    Register a new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user (password is hashed in pre-save hook)
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();

    // Trigger Node.js EventEmitter event
    appEvents.emit('userRegistered', {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    // Exact response matching assignment screenshot Fig 1 and prompt:
    // Status 201 Created
    return res.status(201).json({
      message: 'User registered',
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
};

// @desc    Authenticate user and get JWT
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret_jwt_key_lab4_secure_connect_platform_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    // Trigger Node.js EventEmitter event
    appEvents.emit('userLoggedIn', {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    // Exact response matching assignment screenshot Fig 1: Status 200 OK
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login', error: error.message });
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};
