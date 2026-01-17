const User = require('../models/User');

// Middleware to get user data from session
const getUserData = async (req, res, next) => {
  // Production debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 getUserData middleware:', {
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      hasUser: !!req.user,
      sessionID: req.sessionID,
      userEmail: req.user ? req.user.email : 'No user'
    });
  }
  
  if (req.isAuthenticated() && req.user) {
    try {
      console.log('Getting user data for:', req.user.email || req.user.googleId);
      
      // Get full user data from database - handle both Google OAuth and registered users
      let user;
      if (req.user.googleId) {
        // Google OAuth user
        user = await User.findOne({ googleId: req.user.googleId });
      } else if (req.user.email) {
        // Registered user or fallback
        user = await User.findOne({ email: req.user.email });
      } else {
        // Fallback to _id if available
        user = await User.findById(req.user._id || req.user.id);
      }
      
      if (user) {
        console.log('✅ User found:', user.email);
        res.locals.currentUser = user;
        res.locals.isLoggedIn = true;
        
        if (process.env.NODE_ENV === 'production') {
          console.log('✅ Production: currentUser set for', user.email);
        }
      } else {
        console.log('❌ User not found in database');
        res.locals.currentUser = null;
        res.locals.isLoggedIn = false;
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      res.locals.currentUser = null;
      res.locals.isLoggedIn = false;
    }
  } else {
    console.log('❌ User not authenticated');
    res.locals.currentUser = null;
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
