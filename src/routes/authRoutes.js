/**
 * Authentication Routes
 * Routes for user authentication and account management
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// Sign in routes
router.get('/signin', authController.getSignIn);
router.post('/signin', authController.postSignIn);

// Sign up routes
router.get('/signup', authController.getSignUp);
router.post('/signup', authController.postSignUp);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/signin?error=google_auth_failed',
    failureFlash: false 
  }),
  function(req, res) {
    console.log('Google OAuth successful, user logged in:', req.user ? req.user.email : 'No user');
    res.redirect('/');
  }
);

// Logout
router.get('/logout', authController.logout);

// Dashboard (protected)
router.get('/dashboard', ensureAuthenticated, authController.getDashboard);

module.exports = router;