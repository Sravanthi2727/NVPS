/**
 * Rabuste Coffee Application - MVC Structure
 * Main application file with proper MVC organization
 */

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require('path');

require("dotenv").config();

// Database connection
const connectDB = require('./config/database');
const User = require('./models/User');

// Connect to database
connectDB();

const app = express();

// Passport configuration
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.email, 'ID:', user._id || user.id);
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with ID:', id);
    const user = await User.findById(id);
    if (user) {
      console.log('User deserialized:', user.email);
    } else {
      console.log('User not found for ID:', id);
    }
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails ? profile.emails.map(e => e.value) : 'No emails'
        });
        
        if (!profile.emails || !profile.emails[0]) {
          console.error('No email found in Google profile');
          return done(new Error('No email found in Google profile'), null);
        }
        
        const email = profile.emails[0].value.toLowerCase();
        console.log('Looking for user with email:', email);
        
        let user = await User.findOne({ email: email });
        
        if (user) {
          console.log('Existing user found:', user.email);
          if (!user.isOAuthUser) {
            user.isOAuthUser = true;
            await user.save();
            console.log('Updated user to OAuth user');
          }
          console.log('Returning user to passport:', user.email);
          return done(null, user);
        } else {
          console.log('Creating new user from Google profile');
          user = new User({
            name: profile.displayName || 'User',
            email: email,
            isOAuthUser: true,
            cart: [],
            wishlist: [],
            registered: []
          });
          await user.save();
          console.log('New user created and saved:', user.email);
          return done(null, user);
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        return done(error, null);
      }
    }
  )
);

// Express configuration
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(expressLayouts);

app.set("layout", "layouts/boilerplate");

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to make variables available to all views
app.use((req, res, next) => {
  res.locals.currentPage = req.path;
  res.locals.siteUrl = 'https://rabustecoffee.com';
  next();
});

// Import Routes
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Use Routes
app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  console.log("404 HIT:", req.method, req.originalUrl);
  res.status(404).send("404: " + req.originalUrl);
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error('Error stack:', err.stack);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    path: req.path
  });
  
  // If it's an OAuth error, redirect to signin
  if (req.path && req.path.includes('/auth/google')) {
    return res.redirect("/signin?error=google_auth_failed&message=" + encodeURIComponent(err.message || 'Authentication failed'));
  }
  
  res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;