/**
 * Authentication Controller
 * Handles user authentication, registration, and login
 */

const User = require('../../models/User');

const authController = {
  // Show sign in page
  getSignIn: (req, res) => {
    let error = null;
    if (req.query.error === 'google_auth_failed') {
      error = req.query.message 
        ? decodeURIComponent(req.query.message) 
        : 'Google authentication failed. Please try again.';
    }
    
    res.render("signin", {
      additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
      error: error
    });
  },

  // Handle sign in
  postSignIn: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(401).render("signin", {
          additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
          error: "Invalid email or password."
        });
      }
      
      if (!user.password || user.isOAuthUser) {
        return res.status(401).render("signin", {
          additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
          error: "This account was created with Google. Please sign in with Google."
        });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).render("signin", {
          additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
          error: "Invalid email or password."
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    } catch (error) {
      console.error("Sign in error:", error);
      return res.status(500).render("signin", {
        additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
        error: "An error occurred. Please try again."
      });
    }
  },

  // Show sign up page
  getSignUp: (req, res) => {
    res.render("signup", {
      additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
    });
  },

  // Handle sign up
  postSignUp: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      
      // Validate passwords match
      if (password !== confirmPassword) {
        return res.status(400).render("signup", {
          additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
          error: "Passwords do not match.",
          layout: false 
        });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).render("signup", {
          additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
          error: "Email already registered. Please sign in instead.",
          layout: false
        });
      }
      
      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        cart: [],
        wishlist: [],
        registered: []
      });
      
      await user.save();
      
      // Send welcome email to new user
      try {
        const emailService = require('../../services/emailService');
        console.log('📧 Sending welcome email to new user:', user.email);
        
        const emailResult = await emailService.sendWelcomeEmail(user.email, user.name);
        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully');
        } else {
          console.error('❌ Failed to send welcome email:', emailResult.error);
        }

        // Send admin notification for new user registration
        console.log('📧 Sending admin notification for new user registration');
        const adminEmailResult = await emailService.notifyAdminNewUserRegistration(user);
        if (adminEmailResult.success) {
          console.log('✅ Admin notification email sent successfully');
        } else {
          console.error('❌ Failed to send admin notification email:', adminEmailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending emails:', emailError);
        // Don't fail signup if email fails
      }
      
      // Log user in after signup
      req.login(user, (err) => {
        if (err) {
          console.error("Passport login error after signup:", err);
          return res.status(500).render("signup", {
            additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
            error: "Account created, but automatic login failed. Please sign in manually.",
            layout: false
          });
        }
        return res.redirect("/");
      });

    } catch (error) {
      console.error("Sign up error:", error);
      return res.status(500).render("signup", {
        additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
        error: "An unexpected error occurred. Please try again.",
        layout: false
      });
    }
  },

  // Handle logout
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  },

  // Dashboard (protected route)
  getDashboard: (req, res) => {
    res.render('dashboard', {
      title: 'My Dashboard - Rabuste Coffee',
      description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
      currentPage: '/dashboard',
      user: req.user
    });
  }
};

module.exports = authController;