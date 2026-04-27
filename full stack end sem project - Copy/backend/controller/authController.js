const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (normalizedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (normalizedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPassword, salt);

    user = new User({ 
      username: normalizedUsername, 
      email: normalizedEmail, 
      password: hashedPassword 
    });
    
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Registration Error:', err);
    if (err.name === 'ValidationError') {
      const firstError = Object.values(err.errors)[0];
      return res.status(400).json({ message: firstError.message });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
