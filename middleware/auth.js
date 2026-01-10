const User = require('../models/User');

// Middleware to get user data from session
const getUserData = async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    try {
      // Get full user data from database
      const user = await User.findOne({ googleId: req.user.googleId });
      if (user) {
        res.locals.currentUser = user;
        res.locals.isLoggedIn = true;
      } else {
        res.locals.isLoggedIn = false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.locals.isLoggedIn = false;
    }
  } else {
    res.locals.isLoggedIn = false;
  }
  next();
};

// Example: Get all users for admin purposes
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Example: Get user by email
const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

module.exports = {
  getUserData,
  getAllUsers,
  getUserByEmail
};
