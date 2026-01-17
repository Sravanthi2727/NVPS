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
app.use(express.static("public"));
app.use(expressLayouts);

app.set("layout", "layouts/boilerplate");

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

// Menu Management - Image Upload (must be before admin routes)
const multer = require('multer');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/menu/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Image upload endpoint
app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      
      const imageUrl = '/uploads/menu/' + req.file.filename;
      console.log('Image uploaded successfully:', imageUrl);
      res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// Admin middleware
function ensureAdmin(req, res, next) {
  // For now, just allow all requests to admin routes for testing
  return next();
  
  // Original code (commented out for testing):
  // if (req.isAuthenticated()) {
  //   return next();
  // }
  // res.redirect('/signin');
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

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}

// Dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'My Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
    currentPage: '/dashboard',
    user: req.user
  });
});

// Test Google Maps page
app.get('/test-maps', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-maps.html'));
});

// Debug route to check Google Maps API key
app.get('/debug/google-maps-key', (req, res) => {
  res.json({
    apiKeyExists: !!process.env.GOOGLE_MAPS_API,
    apiKeyLength: process.env.GOOGLE_MAPS_API ? process.env.GOOGLE_MAPS_API.length : 0,
    apiKeyFirstChars: process.env.GOOGLE_MAPS_API ? process.env.GOOGLE_MAPS_API.substring(0, 10) + '...' : 'Not found'
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

// API Routes for dynamic data


// Debug endpoint to check user data
app.get('/api/debug/user', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.json({ error: 'User not found', userId: req.user._id || req.user.id });
    }
    
    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      cartCount: user.cart ? user.cart.length : 0,
      wishlistCount: user.wishlist ? user.wishlist.length : 0,
      cart: user.cart || [],
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== WISHLIST API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email } : 'No user');
    
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User wishlist:', user.wishlist ? user.wishlist.length : 0, 'items');
    res.json(user.wishlist || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json([]);
  }
});

// Check wishlist status for specific items
app.get('/api/wishlist/check', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.json({ success: false, items: [] });
    }

    const wishlistItems = user.wishlist || [];
    res.json({ 
      success: true, 
      items: wishlistItems,
      exists: wishlistItems.length > 0 
    });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    res.json({ success: false, items: [] });
  }
});

app.post('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== WISHLIST API CALLED ===');
    console.log('Request body:', req.body);
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const { itemId, name, price, image, type } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.itemId === itemId);
    if (existingItem) {
      console.log('Item already exists in wishlist');
      return res.json({ success: false, message: 'Item already in wishlist' });
    }

    console.log('User before wishlist update:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    // Create wishlist item and add to wishlist array
    const wishlistItem = { 
      itemId, 
      name, 
      price, 
      image,
      type: type || 'menu' // Default to menu if not specified
    };
    user.wishlist.push(wishlistItem);
    
    console.log('Wishlist item to add:', wishlistItem);

    // Mark only wishlist as modified, preserve other fields
    user.markModified('wishlist');
    await user.save();

    console.log('Wishlist item added successfully');
    res.json({ success: true, message: 'Item added to wishlist successfully' });

  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.delete('/api/wishlist/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.wishlist.pull({ itemId: req.params.itemId });
    await user.save();
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/cart', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== CART API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email } : 'No user');
    
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User cart:', user.cart ? user.cart.length : 0, 'items');
    res.json(user.cart || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json([]);
  }
});

// User: Get user's orders
app.get('/api/user/orders', async (req, res) => {
  try {
    console.log('=== USER ORDERS API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      console.log('Fetching orders for authenticated user:', userId);
      
      // Find orders by userId (ObjectId) or by customer email as fallback
      const userOrders = await Order.find({
        $or: [
          { userId: userId },
          { customerEmail: req.user.email }
        ]
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${userOrders.length} orders for user ${userId} (${req.user.email})`);
      res.json(userOrders);
    } else {
      console.log('User not authenticated');
      // For debugging, return recent orders
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
      console.log('Returning recent orders for debugging:', recentOrders.length);
      res.json(recentOrders);
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// User: Get user's purchased art item IDs (completed orders only)
app.get('/api/user/purchased-arts', async (req, res) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user._id || req.user.id;
      
      // Find completed orders with art items
      const completedArtOrders = await Order.find({
        userId: userId,
        orderType: 'art',
        status: 'completed'
      });
      
      // Extract art item IDs from completed orders
      const purchasedArtIds = [];
      completedArtOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === 'art' && item.itemId) {
            purchasedArtIds.push(String(item.itemId));
          }
        });
      });
      
      // Remove duplicates
      const uniquePurchasedArtIds = [...new Set(purchasedArtIds)];
      
      console.log(`Found ${uniquePurchasedArtIds.length} purchased art items for user ${userId}`);
      res.json({ purchasedArtIds: uniquePurchasedArtIds });
    } else {
      res.json({ purchasedArtIds: [] });
    }
  } catch (error) {
    console.error('Error fetching purchased arts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchased arts', purchasedArtIds: [] });
  }
});

// User: Get user's franchise applications
app.get('/api/user/franchise', async (req, res) => {
  try {
    console.log('=== USER FRANCHISE API CALLED ===');
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      const userId = req.user._id || req.user.id;
      const userEmail = req.user.email;
      
      console.log('Fetching franchise applications for user:', userId, userEmail);
      
      // Find applications by userId or email (for backward compatibility)
      const userApplications = await Franchise.find({
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      }).sort({ submittedAt: -1 });
      
      console.log(`Found ${userApplications.length} franchise applications for user`);
      
      res.json({ success: true, applications: userApplications });
    } else {
      res.status(401).json({ success: false, message: 'Authentication required' });
    }
  } catch (error) {
    console.error('Error fetching user franchise applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch franchise applications', error: error.message });
  }
});

app.post('/api/cart', ensureAuthenticated, async (req, res) => {
  try {
    console.log('=== CART API CALLED ===');
    console.log('Request body:', req.body);
    console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
    console.log('User object:', req.user);
    
    const { itemId, name, price, image, quantity, type } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItem = user.cart.find(item => item.itemId === itemId);
    if (existingItem) {
      // For art items, don't allow duplicates (unique pieces)
      if (type === 'art') {
        console.log('Art item already in cart, preventing duplicate');
        return res.json({ success: false, message: 'This artwork is already in your cart. Art pieces are unique and cannot be duplicated.' });
      }
      // For menu items, update quantity
      existingItem.quantity += (quantity || 1);
      user.markModified('cart');
      await user.save();
      console.log('Menu item quantity updated');
      return res.json({ success: true, message: 'Item quantity updated' });
    }

    console.log('User before cart update:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Create cart item and add to cart array
    const cartItem = { 
      itemId, 
      name, 
      price, 
      image, 
      quantity: type === 'art' ? 1 : (quantity || 1), // Art items always quantity 1
      type: type || 'menu', // Default to menu if not specified
      paymentMethod: req.body.paymentMethod || 'online' // Add payment method
    };
    user.cart.push(cartItem);
    
    console.log('Cart item to add:', cartItem);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('Cart item added successfully');
    res.json({ success: true, message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.delete('/api/cart/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.cart.pull({ itemId: req.params.itemId });
    await user.save();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const registrations = await WorkshopRegistration.find({ userId: req.user.id }).populate('workshopId');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workshop registrations' });
  }
});

// Public workshop registration endpoint (no authentication required)
app.post('/api/workshops/register', async (req, res) => {
  try {
    const { workshopId, workshopName, workshopDate, participantName, participantEmail, participantPhone } = req.body;
    
    // Validate required fields
    if (!workshopId || !workshopName || !workshopDate || !participantName || !participantEmail || !participantPhone) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    // Validate workshop exists
    const workshop = await WorkshopModel.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ 
        success: false,
        error: 'Workshop not found' 
      });
    }

    // Check if email is already registered for this workshop
    const existingRegistration = await WorkshopRegistration.findOne({
      participantEmail: participantEmail,
      workshopId: workshopId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        error: 'This email is already registered for this workshop' 
      });
    }
    
    // Get userId if user is authenticated, otherwise null for public registration
    const userId = req.isAuthenticated && req.isAuthenticated() && req.user ? req.user.id : null;
    
    const registration = new WorkshopRegistration({
      userId: userId,
      workshopId,
      workshopName,
      workshopDate: new Date(workshopDate),
      participantName,
      participantEmail,
      participantPhone,
      status: 'registered'
    });
    
    await registration.save();
    res.json({ 
      success: true, 
      message: 'Registration successful! You will receive a confirmation email shortly.',
      registration: registration 
    });
  } catch (error) {
    console.error('Workshop registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error registering for workshop. Please try again.' 
    });
  }
});

// Authenticated workshop registration endpoint (for logged-in users)
app.post('/api/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const { workshopId, workshopName, workshopDate, participantName, participantEmail, participantPhone } = req.body;
    
    // Check if user is already registered for this workshop
    const existingRegistration = await WorkshopRegistration.findOne({
      userId: req.user.id,
      workshopId: workshopId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        error: 'You are already registered for this workshop' 
      });
    }
    
    const registration = new WorkshopRegistration({
      userId: req.user.id,
      workshopId,
      workshopName,
      workshopDate: new Date(workshopDate),
      participantName,
      participantEmail,
      participantPhone,
      status: 'registered'
    });
    
    await registration.save();
    res.json({ success: true, registration: registration });
  } catch (error) {
    console.error('Workshop registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error registering for workshop' 
    });
  }
});

app.delete('/api/workshops/:id', ensureAuthenticated, async (req, res) => {
  try {
    await WorkshopRegistration.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error canceling workshop registration' });
  }
});

// Workshop proposal submission endpoint
app.post('/submit-workshop-proposal', async (req, res) => {
  try {
    const proposalData = req.body;
    
    // Create a new request with the workshop proposal data
    const request = new Request({
      userId: req.isAuthenticated() ? req.user.id : null,
      type: 'conduct-workshop',
      title: proposalData.title,
      description: proposalData.description,
      details: {
        category: proposalData.category,
        organizerName: proposalData.organizerName,
        organizerEmail: proposalData.organizerEmail,
        organizerPhone: proposalData.organizerPhone,
        organizerExperience: proposalData.organizerExperience,
        duration: proposalData.duration,
        capacity: proposalData.capacity,
        skillLevel: proposalData.skillLevel,
        price: proposalData.price,
        preferredDate: proposalData.preferredDate,
        materialsNeeded: proposalData.materialsNeeded,
        collaborationType: proposalData.collaborationType,
        additionalNotes: proposalData.additionalNotes
      },
      status: 'pending',
      submittedDate: new Date()
    });
    
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Workshop proposal submitted successfully! We will review it and get back to you soon.' 
    });
  } catch (error) {
    console.error('Error submitting workshop proposal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit workshop proposal. Please try again.' 
    });
  }
});

// Simple test payment endpoint (no auth required)
app.post('/api/test-payment', async (req, res) => {
  try {
    console.log('Test payment endpoint called');
    
    // Simple response without Razorpay SDK for testing
    const testOrder = {
      id: 'test_order_' + Date.now(),
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      razorpayKeyId: 'rzp_test_S2a2ZZ2ERWzWeB', // Your key
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '9999999999'
    };
    
    console.log('Sending test order:', testOrder);
    
    res.json({
      success: true,
      order: testOrder,
      message: 'Test order created successfully'
    });
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Test payment failed: ' + error.message
    });
  }
});

// Main payment order creation endpoint
app.post('/api/create-payment-order', ensureAuthenticated, async (req, res) => {
  try {
    const { itemId, name, price, image, type } = req.body;
    
    console.log('Creating payment order for:', { name, price, type });
    
    // Convert rupees to paise (multiply by 100)
    const amountInPaise = Math.round(price * 100);
    
    console.log(`Price conversion: ₹${price} → ${amountInPaise} paise`);
    
    const order = {
      id: 'order_' + Date.now(),
      amount: amountInPaise, // Amount in paise
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || ''
    };
    
    console.log('Created payment order:', order);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order: ' + error.message
    });
  }
});

// Test payment verification (no auth required)
app.post('/api/test-verify', async (req, res) => {
  try {
    const { paymentResponse } = req.body;
    console.log('Test payment verification:', paymentResponse);
    
    res.json({
      success: true,
      message: 'Test payment verified successfully',
      paymentId: paymentResponse.razorpay_payment_id
    });
  } catch (error) {
    console.error('Test verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Test verification failed'
    });
  }
});

// Create order after successful payment (Gallery) - No auth for testing
app.post('/api/create-order-after-payment', async (req, res) => {
  try {
    const { paymentResponse, itemId, itemName, price, image, userId } = req.body;
    
    console.log('=== CREATING GALLERY ORDER ===');
    console.log('Payment Response:', paymentResponse);
    console.log('Item:', { itemId, itemName, price });
    console.log('User ID:', userId);
    
    // Get user ID from request or body
    let actualUserId = userId;
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      actualUserId = req.user._id || req.user.id;
      console.log('Using authenticated user ID:', actualUserId);
    } else {
      console.log('No authentication, using provided user ID:', actualUserId);
    }
    
    if (!actualUserId) {
      // Create a dummy user ID for testing
      actualUserId = '507f1f77bcf86cd799439011';
      console.log('Using dummy user ID for testing:', actualUserId);
    }
    
    // Create order record
    const order = new Order({
      userId: actualUserId,
      customerName: req.user ? req.user.name : 'Test Customer',
      customerEmail: req.user ? req.user.email : 'test@example.com',
      items: [{
        itemId: itemId,
        name: itemName,
        price: price,
        quantity: 1,
        image: image,
        type: 'art'
      }],
      totalAmount: price,
      status: 'pending', // Default status
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Gallery order created successfully:', order._id);
    
    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      orderStatus: 'pending'
    });
    
  } catch (error) {
    console.error('❌ Error creating gallery order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

// Simple test endpoint
app.post('/api/test-endpoint', (req, res) => {
  console.log('Test endpoint called');
  res.json({ success: true, message: 'Test endpoint working' });
});

// Create art request from cart (Dashboard) - No auth for testing
app.post('/api/create-art-order-after-payment', async (req, res) => {
  console.log('=== ART REQUEST ENDPOINT CALLED ===');
  console.log('Session ID:', req.sessionID);
  console.log('User authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'No auth function');
  console.log('User object:', req.user ? { id: req.user._id || req.user.id, email: req.user.email, name: req.user.name } : 'No user');
  console.log('Session data:', req.session ? Object.keys(req.session) : 'No session');
  
  try {
    const { paymentResponse, orderData, userId } = req.body;
    
    console.log('Request body received:', {
      hasPaymentResponse: !!paymentResponse,
      hasOrderData: !!orderData,
      userId: userId,
      paymentId: paymentResponse?.razorpay_payment_id
    });
    
    if (!paymentResponse || !paymentResponse.razorpay_payment_id) {
      console.error('Missing payment response');
      return res.status(400).json({
        success: false,
        message: 'Payment response is required'
      });
    }
    
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      console.error('Missing order data or items');
      return res.status(400).json({
        success: false,
        message: 'Order data with items is required'
      });
    }
    
    // Get user ID and info from authenticated session
    let actualUserId = null;
    let customerName = 'Guest User';
    let customerEmail = 'guest@example.com';
    
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      actualUserId = req.user._id || req.user.id;
      customerName = req.user.name || 'User';
      customerEmail = req.user.email || 'user@example.com';
      console.log('Using authenticated user:', { id: actualUserId, name: customerName, email: customerEmail });
    } else {
      console.log('No authentication, using provided user ID:', userId);
      // Use provided userId or generate one for testing
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        actualUserId = userId;
      } else {
        actualUserId = new mongoose.Types.ObjectId();
      }
      // Use delivery address info for customer details
      if (orderData.deliveryAddress) {
        customerName = orderData.deliveryAddress.name || customerName;
        customerEmail = orderData.deliveryAddress.email || customerEmail;
      }
    }
    
    console.log('Final user details:', { actualUserId, customerName, customerEmail });
    
    // Calculate total
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('Calculated total amount:', totalAmount);
    
    // Validate delivery address
    if (!orderData.deliveryAddress || !orderData.deliveryAddress.name) {
      console.error('Missing delivery address');
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }
    
    // Create art request instead of order
    const Request = require('./models/Request');
    
    // Create title and description from items
    const itemNames = orderData.items.map(item => item.name).join(', ');
    const title = `Art Purchase Request - ${itemNames}`;
    const description = `
Art Purchase Request Details:
- Items: ${orderData.items.map(item => `${item.name} (₹${item.price})`).join(', ')}
- Total Amount: ₹${totalAmount}
- Payment Method: ${orderData.paymentMethod || 'online'}
- Payment ID: ${paymentResponse.razorpay_payment_id}
- Customer: ${customerName} (${customerEmail})
- Delivery Address: ${orderData.deliveryAddress.name}, ${orderData.deliveryAddress.address}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} - ${orderData.deliveryAddress.pincode}
- Phone: ${orderData.deliveryAddress.phone}
    `.trim();
    
    const artRequest = new Request({
      userId: actualUserId,
      type: 'sell-art', // Using existing enum value
      title: title,
      description: description,
      status: 'pending'
    });
    
    console.log('Creating art request with data:', {
      userId: actualUserId,
      title: title,
      type: 'sell-art'
    });
    
    await artRequest.save();
    
    console.log('✅ Art request created successfully:', artRequest._id);
    
    // Try to remove art items from user's cart (if user is authenticated)
    try {
      const User = require('./models/User');
      let userToUpdate = null;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        // Use authenticated user
        userToUpdate = await User.findById(req.user._id || req.user.id);
        console.log('Found authenticated user for cart update:', userToUpdate ? userToUpdate.email : 'not found');
      } else {
        // For testing, try to find any user with the items in cart
        console.log('No authenticated user, skipping cart update');
      }
      
      if (userToUpdate) {
        const artItemIds = orderData.items.map(item => item.itemId);
        console.log('Removing items from cart:', artItemIds);
        console.log('Current cart before removal:', userToUpdate.cart);
        
        userToUpdate.cart = userToUpdate.cart.filter(cartItem => {
          const shouldKeep = !artItemIds.includes(cartItem.itemId);
          console.log(`Item ${cartItem.itemId}: ${shouldKeep ? 'keeping' : 'removing'}`);
          return shouldKeep;
        });
        
        userToUpdate.markModified('cart');
        await userToUpdate.save();
        console.log('✅ Cart updated, remaining items:', userToUpdate.cart.length);
      }
    } catch (cartError) {
      console.error('Cart update error (non-critical):', cartError);
    }
    
    const response = {
      success: true,
      message: 'Art request created successfully',
      requestId: artRequest._id.toString(),
      status: 'pending'
    };
    
    console.log('Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error creating art request:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create art request: ' + error.message,
      error: error.name
    });
  }
});

app.post('/api/verify-payment', ensureAuthenticated, async (req, res) => {
  try {
    const { paymentResponse, itemId, itemName, price, image } = req.body;
    
    // Verify payment signature using Razorpay SDK
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(paymentResponse.razorpay_order_id + '|' + paymentResponse.razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== paymentResponse.razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
    
    console.log('Payment verification successful:', paymentResponse);
    
    // Create order record
    const orderItems = [{
      itemId: itemId,
      name: itemName,
      price: price,
      quantity: 1,
      image: image,
      type: 'art'
    }];
    
    const order = new Order({
      userId: req.user._id || req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      totalAmount: price,
      status: 'completed', // Since payment is verified
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      orderDate: new Date()
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed: ' + error.message
    });
  }
});

// Art Checkout API endpoints
app.post('/api/art-checkout', ensureAuthenticated, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, orderType } = req.body;
    
    // Get user ID
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get user details
    const User = require('./models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Creating art order for user:', userId, user.email);
    
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = new Order({
      userId: userId,
      customerName: user.name || deliveryAddress?.name || 'Customer',
      customerEmail: user.email || deliveryAddress?.email || '',
      items: items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: 'art'
      })),
      totalAmount: totalAmount,
      status: 'pending', // All orders start as pending, admin will approve
      paymentMethod: paymentMethod,
      deliveryAddress: deliveryAddress,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Art order created successfully:', order._id, 'for user:', userId);
    
    // Reload user to get latest cart data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after order creation'
      });
    }
    
    // Remove art items from user's cart - convert all IDs to strings for comparison
    const artItemIds = items.map(item => String(item.itemId));
    console.log('Art item IDs to remove:', artItemIds);
    console.log('Current cart before removal:', updatedUser.cart.map(c => ({ itemId: String(c.itemId), name: c.name })));
    
    const cartBeforeLength = updatedUser.cart.length;
    updatedUser.cart = updatedUser.cart.filter(cartItem => {
      const cartItemId = String(cartItem.itemId);
      const shouldKeep = !artItemIds.includes(cartItemId);
      if (!shouldKeep) {
        console.log(`Removing item from cart: ${cartItemId} - ${cartItem.name}`);
      }
      return shouldKeep;
    });
    
    updatedUser.markModified('cart');
    await updatedUser.save();
    console.log(`✅ Art items removed from cart. Before: ${cartBeforeLength}, After: ${updatedUser.cart.length}`);
    
    res.json({
      success: true,
      message: 'Art order placed successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Art checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place art order: ' + error.message
    });
  }
});

app.post('/api/create-art-payment-order', ensureAuthenticated, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, orderType } = req.body;
    
    // Calculate total in rupees
    const totalAmountInRupees = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Convert to paise (multiply by 100)
    const totalAmountInPaise = Math.round(totalAmountInRupees * 100);
    
    console.log(`Art payment: ₹${totalAmountInRupees} → ${totalAmountInPaise} paise`);
    
    const order = {
      id: 'order_art_' + Date.now(),
      amount: totalAmountInPaise, // Amount in paise
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || deliveryAddress.phone
    };
    
    console.log('Created art payment order:', order);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error creating art payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create art payment order: ' + error.message
    });
  }
});

app.post('/api/verify-art-payment', ensureAuthenticated, async (req, res) => {
  try {
    const { paymentResponse, orderData } = req.body;
    
    // In a real implementation, verify the payment signature with Razorpay
    console.log('Art payment verification:', paymentResponse);
    
    // Get user ID
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get user details
    const User = require('./models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Creating art order for user:', userId, user.email);
    
    // Calculate total
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order record
    const order = new Order({
      userId: userId,
      customerName: user.name || orderData.deliveryAddress?.name || 'Customer',
      customerEmail: user.email || orderData.deliveryAddress?.email || '',
      items: orderData.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: 'art'
      })),
      totalAmount: totalAmount,
      status: 'pending', // All orders start as pending, admin will approve after verification
      paymentMethod: 'online',
      paymentId: paymentResponse.razorpay_payment_id,
      deliveryAddress: orderData.deliveryAddress,
      orderType: 'art',
      orderDate: new Date()
    });
    
    await order.save();
    console.log('✅ Art order created successfully:', order._id, 'for user:', userId);
    
    // Reload user to get latest cart data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after order creation'
      });
    }
    
    // Remove art items from user's cart - convert all IDs to strings for comparison
    const artItemIds = orderData.items.map(item => String(item.itemId));
    console.log('Art item IDs to remove:', artItemIds);
    console.log('Current cart before removal:', updatedUser.cart.map(c => ({ itemId: String(c.itemId), name: c.name })));
    
    const cartBeforeLength = updatedUser.cart.length;
    updatedUser.cart = updatedUser.cart.filter(cartItem => {
      const cartItemId = String(cartItem.itemId);
      const shouldKeep = !artItemIds.includes(cartItemId);
      if (!shouldKeep) {
        console.log(`Removing item from cart: ${cartItemId} - ${cartItem.name}`);
      }
      return shouldKeep;
    });
    
    updatedUser.markModified('cart');
    await updatedUser.save();
    console.log(`✅ Art items removed from cart. Before: ${cartBeforeLength}, After: ${updatedUser.cart.length}`);
    
    res.json({
      success: true,
      message: 'Art payment verified and order created successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error verifying art payment:', error);
    res.status(500).json({
      success: false,
      message: 'Art payment verification failed: ' + error.message
    });
  }
});

// Admin: Get all requests
app.get('/api/admin/requests', async (req, res) => {
  try {
    console.log('=== ADMIN REQUESTS API CALLED ===');
    
    const requests = await Request.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} requests for admin`);
    
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
});

// Admin: Update request status
app.post('/api/admin/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    console.log('Updating request status:', { requestId, status });

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: status },
      { new: true }
    ).populate('userId', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    console.log('✅ Request status updated successfully:', {
      requestId: request._id,
      newStatus: status,
      title: request.title
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error('❌ Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Failed to update request status' });
  }
});

app.get('/api/requests', ensureAuthenticated, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching requests' });
  }
});

app.post('/api/requests', ensureAuthenticated, async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const newRequest = new Request({
      userId: req.user.id,
      type,
      title,
      description,
      status: 'pending'
    });
    await newRequest.save();
    res.json({ success: true, item: newRequest });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting request' });
  }
});

// Cart API routes
app.post('/api/cart/add', async (req, res) => {
  console.log('=== CART ADD API CALLED ===');
  console.log('Request body:', req.body);
  
  try {
    if (!req.isAuthenticated()) {
      console.log('User not authenticated');
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { itemId, name, price, image, quantity = 1 } = req.body;
    console.log('Adding item to cart:', { itemId, name, price });
    
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User before cart update:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Clean up duplicates first (merge items with same itemId)
    const cleanedCart = [];
    const itemMap = new Map();
    
    user.cart.forEach(item => {
      const key = String(item.itemId);
      if (itemMap.has(key)) {
        itemMap.get(key).quantity += item.quantity;
      } else {
        itemMap.set(key, { ...item.toObject() });
      }
    });
    
    itemMap.forEach(item => cleanedCart.push(item));
    user.cart = cleanedCart;
    
    console.log('Cart after cleanup:', user.cart.length, 'items');

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => String(item.itemId) === String(itemId));
    
    // Determine item type based on itemId and name
    let itemType = 'menu'; // default to menu
    if (name) {
      // Check if it's an art item based on name
      if (name.includes('Golden Horizon') || name.includes('City Lights') || 
          name.includes('Eternal Flow') || name.includes('Digital Dreams') ||
          name.includes('Mountain Serenity') || name.includes('Wilderness') ||
          name.includes('by ')) {
        itemType = 'art';
      }
    }
    
    // Check if itemId corresponds to art items
    const artItemIds = ['golden_horizon', 'city_lights', 'eternal_flow', 'digital_dreams', 'mountain_serinity', 'wilderness'];
    if (artItemIds.some(id => itemId.includes(id))) {
      itemType = 'art';
    }
    
    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      user.cart[existingItemIndex].quantity += quantity;
      console.log('Updated existing item quantity:', user.cart[existingItemIndex]);
    } else {
      // New item, add to cart
      const cartItem = { itemId, name, price, image, quantity, type: itemType };
      user.cart.push(cartItem);
      console.log('Added new item to cart:', cartItem);
    }
    
    console.log('User cart after update:', user.cart);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Get AI recommendations
    let recommendations = [];
    try {
      console.log('🤖 Fetching AI recommendations for:', name);
      const aiUrl = `https://nvps-ixb0.onrender.com/recommend?drink=${encodeURIComponent(name)}`;
      console.log('AI API URL:', aiUrl);
      
      const aiResponse = await fetch(aiUrl);
      console.log('AI API response status:', aiResponse.status);
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        console.log('AI response data:', JSON.stringify(aiData, null, 2));
        
        if (aiData.recommendations && aiData.recommendations.length > 0) {
          const MenuItem = require('./models/MenuItem');
          
          // Get all recommended items (not just 4)
          recommendations = await MenuItem.find({
            name: { $in: aiData.recommendations },
            isAvailable: true
          });
          
          console.log('✅ Found', recommendations.length, 'recommendations from AI');
        } else {
          console.log('⚠️ AI returned no recommendations');
        }
      } else {
        console.log('❌ AI API returned error status:', aiResponse.status);
        const errorText = await aiResponse.text();
        console.log('Error response:', errorText);
      }
    } catch (aiError) {
      console.log('❌ AI recommendation error (non-critical):', aiError.message);
      
      // Fallback: Get similar items from same category
      try {
        console.log('🔄 Using fallback recommendations...');
        const MenuItem = require('./models/MenuItem');
        const addedItem = await MenuItem.findById(itemId);
        
        if (addedItem) {
          recommendations = await MenuItem.find({
            category: addedItem.category,
            _id: { $ne: itemId },
            isAvailable: true
          }).limit(6);
          
          console.log('✅ Using', recommendations.length, 'fallback recommendations');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback recommendations error:', fallbackError.message);
      }
    }

    console.log('📤 Sending response with', recommendations.length, 'recommendations');
    
    res.json({ 
      success: true, 
      message: 'Item added to cart',
      recommendations: recommendations.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description
      }))
    });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/cart/count', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ count: 0 });
    }

    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    const count = user ? user.cart.length : 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({ count: 0 });
  }
});

// Wishlist API routes
app.post('/api/wishlist/add', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { itemId, name, price, image } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.itemId === itemId);
    if (existingItem) {
      return res.json({ success: false, message: 'Item already in wishlist' });
    }

    console.log('User before wishlist update:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    // Create wishlist item and add to wishlist array
    const wishlistItem = { itemId, name, price, image };
    user.wishlist.push(wishlistItem);
    
    console.log('Wishlist item to add:', wishlistItem);
    console.log('User wishlist after push:', user.wishlist);

    // Mark only wishlist as modified, preserve other fields
    user.markModified('wishlist');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      wishlistLength: user.wishlist.length
    });

    res.json({ success: true, message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/wishlist/count', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ count: 0 });
    }

    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    const count = user ? user.wishlist.length : 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Wishlist count error:', error);
    res.status(500).json({ count: 0 });
  }
});

app.patch('/api/cart/:itemId', ensureAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Handle both string and ObjectId itemId
    const paramItemId = req.params.itemId;
    const item = user.cart.find(item => 
      item.itemId.toString() === paramItemId || 
      item.itemId === paramItemId
    );
    
    if (!item) {
      console.log('Item not found in cart. Looking for:', paramItemId);
      console.log('Available items:', user.cart.map(i => ({ itemId: i.itemId, itemIdStr: i.itemId.toString() })));
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      user.cart.pull({ itemId: item.itemId });
    } else {
      // Update quantity
      item.quantity = quantity;
    }

    user.markModified('cart');
    await user.save();
    res.json({ success: true, message: 'Cart quantity updated' });
  } catch (error) {
    console.error('Cart quantity update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/cart/remove/:itemId', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove item from cart
    user.cart.pull({ _id: req.params.itemId });
    await user.save();

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Checkout API - Convert cart to order
app.post('/api/checkout', ensureAuthenticated, async (req, res) => {
  try {
    const { orderType = 'menu', items } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Use provided items or get from user cart
    let cartItems = items || user.cart;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Filter items based on order type if not provided
    if (!items && orderType === 'menu') {
      cartItems = user.cart.filter(item => {
        // Check if item has explicit type property
        if (item.type === 'art') return false;
        
        // Check if item is from artworks.json structure
        if (item.artist || item.category === 'painting' || item.category === 'photography' || 
            item.category === 'sculpture' || item.category === 'digital') return false;
        
        // Check image paths for art items
        if (item.image && (item.image.includes('/assets/gallery/') || 
            item.image.includes('golden_origin') || item.image.includes('city_lights') ||
            item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
            item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) return false;
        
        // Check item names that are clearly art pieces
        if (item.name && (item.name.includes('by ') || 
            item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
            item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
            item.name.includes('Mountain Serenity') || item.name.includes('Wilderness'))) return false;
        
        return true;
      });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: `No ${orderType} items in cart` });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create new order
    const newOrder = new Order({
      userId: user._id,
      customerName: user.name || user.displayName,
      customerEmail: user.email,
      items: cartItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        type: item.type || 'menu'
      })),
      totalAmount: totalAmount,
      status: 'pending',
      paymentMethod: 'cash', // Menu items are typically cash/pickup
      orderType: orderType
    });

    console.log('Creating order for user:', user._id, 'with', cartItems.length, 'items');

    // Save order
    await newOrder.save();

    console.log('Order saved successfully:', newOrder._id);

    // Remove processed items from user's cart
    if (!items) {
      // If no specific items provided, remove the filtered items
      const processedItemIds = cartItems.map(item => item.itemId);
      user.cart = user.cart.filter(cartItem => !processedItemIds.includes(cartItem.itemId));
    } else {
      // If specific items provided, remove those
      const processedItemIds = items.map(item => item.itemId);
      user.cart = user.cart.filter(cartItem => !processedItemIds.includes(cartItem.itemId));
    }
    
    user.markModified('cart');
    await user.save();

    console.log('Order created:', {
      orderId: newOrder._id,
      customer: user.name || user.displayName,
      email: user.email,
      totalAmount: totalAmount,
      itemCount: newOrder.items.length,
      orderType: orderType
    });

    res.json({ 
      success: true, 
      message: 'Order placed successfully!',
      orderId: newOrder._id,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

// Simple test route
app.get('/test-route', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Fix: Update existing cart items with correct type
app.post('/api/debug/fix-cart-types', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please login first' });
    }
    
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedCount = 0;
    
    // Update cart items with correct type
    user.cart = user.cart.map(item => {
      if (!item.type || item.type === 'NOT_SET') {
        // Detect if this is an art item
        const isArt = item.artist || 
                     ['painting','photography','sculpture','digital'].includes(item.category) ||
                     (item.image && (item.image.includes('/assets/gallery/') || 
                      item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                      item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                      item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) ||
                     (item.name && (item.name.includes('by ') || 
                      item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                      item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                      item.name.includes('Mountain Serenity') || item.name.includes('Wilderness')));
        
        item.type = isArt ? 'art' : 'menu';
        updatedCount++;
      }
      return item;
    });
    
    user.markModified('cart');
    await user.save();
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} cart items with correct type`,
      totalItems: user.cart.length,
      artItems: user.cart.filter(item => item.type === 'art').length,
      menuItems: user.cart.filter(item => item.type === 'menu').length
    });
  } catch (error) {
    console.error('Fix cart types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug: Check cart items with type info
app.get('/api/debug/cart-items', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please login first' });
    }
    
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze cart items
    const cartAnalysis = user.cart.map(item => {
      const isArt = item.type === 'art' || 
                   item.artist || 
                   ['painting','photography','sculpture','digital'].includes(item.category) ||
                   (item.image && (item.image.includes('/assets/gallery/') || 
                    item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                    item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                    item.image.includes('mountain_serinity') || item.image.includes('wilderness'))) ||
                   (item.name && (item.name.includes('by ') || 
                    item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                    item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                    item.name.includes('Mountain Serenity') || item.name.includes('Wilderness')));
      
      return {
        itemId: item.itemId,
        name: item.name,
        type: item.type || 'NOT_SET',
        detectedAs: isArt ? 'art' : 'menu',
        hasArtist: !!item.artist,
        category: item.category,
        image: item.image,
        hasImagePaths: item.image && (item.image.includes('/assets/gallery/') || 
                    item.image.includes('golden_origin') || item.image.includes('city_lights') ||
                    item.image.includes('eternal_flow') || item.image.includes('Digital_dreams') ||
                    item.image.includes('mountain_serinity') || item.image.includes('wilderness')),
        hasArtName: item.name && (item.name.includes('by ') || 
                    item.name.includes('Golden Horizon') || item.name.includes('City Lights') ||
                    item.name.includes('Eternal Flow') || item.name.includes('Digital Dreams') ||
                    item.name.includes('Mountain Serenity') || item.name.includes('Wilderness'))
      };
    });
    
    res.json({
      totalItems: user.cart.length,
      artItems: cartAnalysis.filter(item => item.detectedAs === 'art').length,
      menuItems: cartAnalysis.filter(item => item.detectedAs === 'menu').length,
      items: cartAnalysis
    });
  } catch (error) {
    console.error('Debug cart items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug: Check menu items in database
app.get('/api/debug/menu-items', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    console.log('Total menu items in database:', menuItems.length);
    res.json({
      total: menuItems.length,
      items: menuItems.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        isAvailable: item.isAvailable,
        image: item.image
      }))
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Check artworks in database
app.get('/api/debug/artworks', async (req, res) => {
  try {
    const Artwork = require('./models/Artwork');
    const artworks = await Artwork.find();
    console.log('Total artworks in database:', artworks.length);
    res.json({
      total: artworks.length,
      items: artworks.map(item => ({
        id: item._id,
        title: item.title,
        artist: item.artist,
        category: item.category,
        price: item.price,
        isAvailable: item.isAvailable,
        image: item.image
      }))
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Get all orders (temporary for testing)
app.get('/api/debug/orders', async (req, res) => {
  try {
    const allOrders = await Order.find().populate('userId', 'name email');
    console.log('All orders in database:', allOrders.length);
    res.json({ 
      total: allOrders.length, 
      orders: allOrders.map(o => ({
        id: o._id,
        userId: o.userId,
        customerName: o.customerName,
        status: o.status,
        total: o.totalAmount,
        date: o.orderDate
      }))
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check if routes are working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date() });
});

// Menu Management API Routes
// Get all menu items
app.get('/api/menu-items', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json({ success: true, items: menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new menu item
app.post('/api/menu-items', ensureAdmin, async (req, res) => {
  try {
    const { category, name, description, price, image, available } = req.body;
    
    const newItem = new MenuItem({
      category,
      name,
      description,
      price,
      image,
      available: available !== false
    });
    
    await newItem.save();
    res.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update menu item
app.put('/api/menu-items/:id', ensureAdmin, async (req, res) => {
  try {
    const { category, name, description, price, image, available } = req.body;
    
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { category, name, description, price, image, available },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete menu item
app.delete('/api/menu-items/:id', ensureAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug: Create test franchise application
app.post('/api/debug/create-franchise', async (req, res) => {
  try {
    const testApplication = new Franchise({
      fullName: 'Test Applicant',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      city: 'Mumbai',
      investmentRange: '₹75K - ₹100K',
      expectedTimeline: '6-12 months',
      businessExperience: 'I have 5 years of retail experience',
      status: 'pending'
    });

    await testApplication.save();
    console.log('Test franchise application created:', testApplication._id);
    
    res.json({ 
      success: true, 
      message: 'Test application created',
      application: testApplication
    });
  } catch (error) {
    console.error('Error creating test application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug: Get all franchise applications (temporary for testing)
app.get('/api/debug/franchise', async (req, res) => {
  try {
    const allApplications = await Franchise.find().sort({ submittedAt: -1 });
    console.log('All franchise applications in database:', allApplications.length);
    res.json({ 
      total: allApplications.length, 
      applications: allApplications.map(app => ({
        id: app._id,
        name: app.fullName,
        email: app.email,
        city: app.city,
        status: app.status,
        submittedAt: app.submittedAt,
        userId: app.userId
      }))
    });
  } catch (error) {
    console.error('Error fetching all franchise applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all orders
app.get('/api/admin/orders', ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Get all orders for admin (no auth for testing)
app.get('/api/all-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });

    console.log('Found', orders.length, 'orders in database');
    
    res.json({ 
      success: true, 
      orders: orders,
      count: orders.length 
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

// Admin: Update order status
// Admin: Update order status (temporarily no auth for testing)
app.post('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    console.log('Updating order status:', { orderId, status });

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('✅ Order status updated successfully:', {
      orderId: order._id,
      newStatus: status,
      customer: order.customerName
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Admin: Get all franchise applications
app.get('/api/admin/franchise', ensureAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN FRANCHISE API CALLED ===');
    const applications = await Franchise.find()
      .sort({ submittedAt: -1 });

    console.log('Found franchise applications:', applications.length);
    applications.forEach(app => {
      console.log(`- ${app.fullName} (${app.email}) - ${app.status} - ${app.submittedAt}`);
    });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching franchise applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch franchise applications' });
  }
});

// Admin: Update franchise application status
app.post('/api/admin/franchise/:id/status', ensureAdmin, async (req, res) => {
  try {
    const { status, adminNotes, reviewedBy } = req.body;
    const applicationId = req.params.id;

    if (!['pending', 'approved', 'rejected', 'under-review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Franchise.findByIdAndUpdate(
      applicationId,
      { 
        status: status,
        adminNotes: adminNotes || '',
        reviewedBy: reviewedBy || 'Admin',
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    console.log('Franchise application status updated:', {
      applicationId: application._id,
      newStatus: status,
      applicant: application.fullName,
      reviewedBy: reviewedBy
    });

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating franchise application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
});

// Real-time analytics update endpoint
app.get('/api/admin/analytics-update', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');
    const WorkshopRegistration = require('./models/WorkshopRegistration');

    const quickStats = {
      totalUsers: await User.countDocuments(),
      totalOrders: await Order.countDocuments(),
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      totalWorkshopRegistrations: await WorkshopRegistration.countDocuments()
    };

    res.json(quickStats);
  } catch (error) {
    console.error('Analytics update error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics update' });
  }
});

// Test analytics data endpoint
app.get('/api/admin/analytics-test', async (req, res) => {
  try {
    const User = require('./models/User');
    const Order = require('./models/Order');
    
    const testData = {
      usersCount: await User.countDocuments(),
      ordersCount: await Order.countDocuments(),
      sampleUsers: await User.find().limit(3).select('name email createdAt'),
      sampleOrders: await Order.find().limit(3).select('customerName totalAmount orderDate status'),
      timestamp: new Date().toISOString()
    };

    console.log('📊 Analytics test data:', testData);
    res.json(testData);
  } catch (error) {
    console.error('Analytics test error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wishlist/remove/:itemId', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove item from wishlist
    user.wishlist.pull({ _id: req.params.itemId });
    await user.save();

    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
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

// API route to get all users (for admin purposes)
app.get("/api/users", async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('googleId displayName email createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Use admin routes - All admin routes are now handled by MVC structure
// app.use('/admin', adminRoutes); // Already registered above

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
