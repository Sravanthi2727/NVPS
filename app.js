/**
 * Rabuste Coffee Application - MVC Structure
 * Main application file with proper MVC organization (includes Gemini chatbot).
 */

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const mongoose = require("mongoose");
const compression = require('compression');
const helmet = require('helmet');
const { checkAdminRole } = require('./middleware/adminAuth');
require("dotenv").config();

// Database connection
const connectDB = require("./config/database");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const Workshop = require("./models/Workshop");
const WorkshopRegistration = require("./models/WorkshopRegistration");
const Artwork = require("./models/Artwork");
const Order = require("./models/Order");
const Franchise = require("./models/Franchise");

// Import middleware
const { getUserData } = require('./middleware/auth');

// Connect to database
connectDB();

const app = express();

// Passport configuration
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.email, "ID:", user._id || user.id);
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user with ID:", id);
    const user = await User.findById(id);
    if (user) {
      console.log("User deserialized:", user.email);
    } else {
      console.log("User not found for ID:", id);
    }
    done(null, user);
  } catch (error) {
    console.error("Deserialization error:", error);
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
        console.log("Google OAuth profile received:", {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails ? profile.emails.map((e) => e.value) : "No emails"
        });

        if (!profile.emails || !profile.emails[0]) {
          console.error("No email found in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        const email = profile.emails[0].value.toLowerCase();
        console.log("Looking for user with email:", email);

        let user = await User.findOne({ email: email });

        if (user) {
          console.log("Existing user found:", user.email);
          if (!user.isOAuthUser) {
            user.isOAuthUser = true;
            await user.save();
            console.log("Updated user to OAuth user");
          }
          console.log("Returning user to passport:", user.email);
          return done(null, user);
        } else {
          console.log("Creating new user from Google profile");
          user = new User({
            name: profile.displayName || "User",
            email: email,
            isOAuthUser: true,
            cart: [],
            wishlist: [],
            registered: []
          });
          await user.save();
          console.log("New user created and saved:", user.email);
          
          // Send welcome email to new Google OAuth user
          try {
            const emailService = require('./services/emailService');
            console.log('📧 Sending welcome email to new Google user:', user.email);
            
            const emailResult = await emailService.sendWelcomeEmail(user.email, user.name);
            if (emailResult.success) {
              console.log('✅ Welcome email sent successfully to Google user');
            } else {
              console.error('❌ Failed to send welcome email to Google user:', emailResult.error);
            }

            // Send admin notification for new Google user registration
            console.log('📧 Sending admin notification for new Google user registration');
            const adminEmailResult = await emailService.notifyAdminNewUserRegistration(user);
            if (adminEmailResult.success) {
              console.log('✅ Admin notification email sent successfully for Google user');
            } else {
              console.error('❌ Failed to send admin notification email for Google user:', adminEmailResult.error);
            }
          } catch (emailError) {
            console.error('❌ Error sending emails for Google user:', emailError);
            // Don't fail OAuth if email fails
          }
          
          return done(null, user);
        }
      } catch (error) {
        console.error("Google OAuth error:", error);
        console.error("Error details:", {
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
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Admin role check middleware (must be after passport)
app.use(checkAdminRole);

app.use(express.static("public"));
app.use(expressLayouts);

app.set("layout", "layouts/boilerplate");

// Test calendar route (for debugging)
app.get('/test-calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-calendar.html'));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware to make variables available to all views
app.use((req, res, next) => {
  res.locals.currentPage = req.path;
  res.locals.siteUrl = "https://rabustecoffee.com";
  next();
});

// Add user data middleware (must be before routes)
app.use(getUserData);

// Import Routes
const homeRoutes = require("./src/routes/homeRoutes");
const menuRoutes = require("./src/routes/menuRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const aboutRoutes = require("./src/routes/aboutRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const artRoutes = require("./src/routes/artRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const apiRoutes = require("./src/routes/apiRoutes");
const geminiRoutes = require("./gemini/gemini.route");
const philosophyRoutes = require("./src/routes/philosophyRoutes");
const workshopRoutes = require("./src/routes/workshopRoutes");
const franchiseRoutes = require("./src/routes/franchiseRoutes");

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// Use Routes - Register API routes FIRST
console.log("🤖 Registering Gemini routes at /api/gemini");
app.use("/api/gemini", geminiRoutes);
console.log("✅ Gemini routes registered");

console.log("🔗 Registering API routes at /api");
app.use("/api", apiRoutes);
console.log("✅ API routes registered");

// Register admin routes FIRST to avoid conflicts
console.log("🔧 Registering admin routes at /admin");
app.use("/admin", adminRoutes);
console.log("✅ Admin routes registered");

// Register all page routes
console.log("🏠 Registering home routes");
app.use("/", homeRoutes);
console.log("✅ Home routes registered");

console.log("🍽️ Registering menu routes");
app.use("/", menuRoutes);
console.log("✅ Menu routes registered");

console.log("🎨 Registering gallery routes");
app.use("/", galleryRoutes);
console.log("✅ Gallery routes registered");

console.log("ℹ️ Registering about routes");
app.use("/", aboutRoutes);
console.log("✅ About routes registered");

console.log("📊 Registering dashboard routes");
app.use("/", dashboardRoutes);
console.log("✅ Dashboard routes registered");

console.log("🎨 Registering art routes");
app.use("/", artRoutes);
console.log("✅ Art routes registered");

console.log("🔐 Registering auth routes");
app.use("/", authRoutes);
console.log("✅ Auth routes registered");

console.log("💭 Registering philosophy routes");
app.use("/", philosophyRoutes);
console.log("✅ Philosophy routes registered");

console.log("🎓 Registering workshop routes");
app.use("/", workshopRoutes);
console.log("✅ Workshop routes registered");

console.log("🏪 Registering franchise routes");
app.use("/", franchiseRoutes);
console.log("✅ Franchise routes registered");

// Auth routes
app.get("/signin", (req, res) => {
  let error = null;
  if (req.query.error === 'google_auth_failed') {
    error = req.query.message 
      ? decodeURIComponent(req.query.message) 
      : 'Google authentication failed. Please try again.';
  }
  
  res.render("signin", {
    additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/signin?error=google_auth_failed",
    failureFlash: false 
  }),
  function(req, res) {
    // Successful authentication - user is already logged in by passport
    console.log('Google OAuth successful, user logged in:', req.user ? req.user.email : 'No user');
    res.redirect("/");
  }
);

app.post("/signin", async (req, res, next) => {
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
      if (err) return next(err); // Uses the 'next' we added above
      return res.redirect("/");
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).render("signin", {
      additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
      error: "An error occurred. Please try again."
    });
  }
});

app.get("/signup", (req, res) => {
  // console.log("at signup");
  res.render("signup", {
    additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
  });
});

app.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // 1. Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).render("signup", {
        additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
        error: "Passwords do not match.",
        layout: false 
      });
    }
    
    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render("signup", {
        additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
        error: "Email already registered. Please sign in instead.",
        layout: false
      });
    }
    
    // 3. Create new user with your original fields
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      cart: [],
      wishlist: [],
      registered: []
    });
    
    await user.save();
    
    // 4. Log user in after signup using Passport
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
    // Explicitly passing a string here fixes the "next is not a function" crash
    return res.status(500).render("signup", {
      additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
      error: "An unexpected error occurred. Please try again.",
      layout: false
    });
  }
});

// Dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'My Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
    currentPage: '/dashboard',
    user: req.user
  });
});

// User Dashboard route
app.get('/user-dashboard', ensureAuthenticated, (req, res) => {
  res.render('user-dashboard', {
    title: 'User Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
    currentPage: '/user-dashboard',
    user: req.user,
    currentUser: req.user,
    GOOGLE_MAPS_API: process.env.GOOGLE_MAPS_API
  });
});

// Simple test route
app.get('/test-route', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Example route to show user data
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/signin");
  }
  
  res.render("profile", {
    title: "My Profile - Rabuste Coffee",
    user: res.locals.currentUser
  });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// 404 Handler
app.use((req, res) => {
  console.log("404 HIT:", req.method, req.originalUrl);
  res.status(404).send("404: " + req.originalUrl);
});

// Error handling middleware
app.use(function (err, req, res, next) {
  console.error("Error stack:", err.stack);
  console.error("Error details:", {
    message: err.message,
    name: err.name,
    path: req.path
  });

  // If it's an OAuth error, redirect to signin
  if (req.path && req.path.includes("/auth/google")) {
    return res.redirect(
      "/signin?error=google_auth_failed&message=" +
        encodeURIComponent(err.message || "Authentication failed")
    );
  }

  res.status(500).send("Something went wrong");
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;