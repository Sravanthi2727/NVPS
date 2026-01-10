/**
 * Rabuste Coffee Application - MVC Structure
 * Main application file with proper MVC organization
 */

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');

require("dotenv").config();
const path = require("path");

// Database connection
const connectDB = require('./config/database');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Artwork = require('./models/Artwork');
const WorkshopModel = require('./models/Workshop');

// Connect to database
connectDB();

const app = express();

// Performance middleware
app.use(compression()); // Compress all responses
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Set caching headers for static assets
app.use(express.static("public", {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true
}));

 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Models
const Wishlist = require('./models/Wishlist');
const Cart = require('./models/Cart');
const Request = require('./models/Request');
const Order = require('./models/Order');

// Controllers
const adminController = require('./src/controllers/adminController');

// Admin middleware
function ensureAdmin(req, res, next) {
  // Simple admin check - in production, implement proper admin authentication
  // For now, just check if user is authenticated
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Admin access required' });
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Wait for database connection
        if (mongoose.connection.readyState !== 1) {
          console.log('Database not connected, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Check again after waiting
        if (mongoose.connection.readyState !== 1) {
          return done(new Error('Database not connected'), null);
        }

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
        
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          console.log('Existing user found:', user.email);
          console.log('Returning user to passport:', user.email);
          return done(null, user);
        } else {
          // Check if user exists with same email but different googleId
          const existingEmailUser = await User.findOne({ email: email });
          if (existingEmailUser) {
            console.log('User with same email exists but different googleId');
            return done(new Error('An account with this email already exists'), null);
          }
          console.log('Creating new user from Google profile');
          // Create new user from Google profile with consistent field names
          user = new User({
            googleId: profile.id,
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
app.use(expressLayouts);

app.set("layout", "layouts/boilerplate");

// Import auth middleware
const { getUserData } = require('./middleware/auth');
const { viewCacheMiddleware, cacheMiddleware } = require('./middleware/cache');

// Middleware to make variables available to all views
app.use((req, res, next) => {
  res.locals.currentPage = req.path;
  res.locals.siteUrl = "https://rabustecoffee.com";
  next();
});

// Add user data middleware after passport setup
app.use(getUserData);

// Home route - Cache for 10 minutes
app.get("/", viewCacheMiddleware(600), (req, res) => {
  res.render("home", {
    title: "Rabuste Coffee - Premium Robusta Coffee & Art",
    description:
      "Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.",
    currentPage: "/",
    keywords:
      "premium robusta coffee, art café, coffee shop, coffee and art, Rabuste Coffee",
    ogTitle: "Rabuste Coffee - Premium Robusta Coffee & Art",
    ogDescription:
      "Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.",
    ogType: "website",
    ogUrl: "https://rabustecoffee.com",
    ogImage: "/assets/coffee-bg.jpeg",
    canonicalUrl: "https://rabustecoffee.com",
  });
});

// Menu route - Dynamic
app.get('/menu', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Return static data if database is not connected
      const staticMenu = {
        cold: {
          'robusta-cold-non-milk': [
            {
              name: 'Robusta Iced Americano',
              description: 'Bold Robusta espresso with chilled water',
              price: 160,
              image: '/assets/assets/menu_images/Iced latte &Iced Americano.jpeg'
            },
            {
              name: 'Robusta Cold Brew',
              description: '24-hour cold extracted Robusta',
              price: 180,
              image: '/assets/assets/menu_images/Iced latte &Iced Americano.jpeg'
            }
          ],
          'robusta-cold-milk': [
            {
              name: 'Robusta Iced Latte',
              description: 'Smooth Robusta with cold milk',
              price: 200,
              image: '/assets/assets/menu_images/Iced latte &Iced Americano.jpeg'
            }
          ]
        },
        hot: {
          'robusta-hot-non-milk': [
            {
              name: 'Robusta Black Coffee',
              description: 'Pure Robusta espresso',
              price: 120,
              image: '/assets/assets/menu_images/Iced latte &Iced Americano.jpeg'
            }
          ]
        }
      };
      
      res.render('menu', {
        title: 'Our Menu - Rabuste Coffee',
        description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
        currentPage: '/menu',
        keywords: 'coffee menu, robusta coffee, café menu, coffee drinks, food menu',
        ogTitle: 'Our Menu - Rabuste Coffee',
        ogDescription: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
        ogType: 'website',
        ogUrl: 'https://rabustecoffee.com/menu',
        ogImage: '/assets/coffee-bg.jpeg',
        canonicalUrl: 'https://rabustecoffee.com/menu',
        menuItems: staticMenu
      });
      return;
    }
    
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, subCategory: 1, displayOrder: 1 });
    
    // Group items by category and subcategory
    const groupedMenu = {};
    menuItems.forEach(item => {
      if (!groupedMenu[item.category]) {
        groupedMenu[item.category] = {};
      }
      if (!groupedMenu[item.category][item.subCategory]) {
        groupedMenu[item.category][item.subCategory] = [];
      }
      groupedMenu[item.category][item.subCategory].push(item);
    });

    res.render('menu', {
      title: 'Our Menu - Rabuste Coffee',
      description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
      currentPage: '/menu',
      keywords: 'coffee menu, robusta coffee, café menu, coffee drinks, food menu',
      ogTitle: 'Our Menu - Rabuste Coffee',
      ogDescription: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/menu',
      ogImage: '/assets/coffee-bg.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/menu',
      menuItems: groupedMenu
    });
  } catch (error) {
    console.error('Menu route error:', error);
    res.status(500).send('Error loading menu');
  }
});

// Gallery route - Dynamic
app.get('/gallery', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Return static data if database is not connected
      const staticArtworks = [
        {
          _id: '1',
          title: 'Sunset Coffee',
          artist: 'Rabuste Artist',
          category: 'painting',
          price: 2500,
          image: '/assets/artwork1.jpg',
          description: 'Beautiful sunset painting',
          isAvailable: true
        },
        {
          _id: '2', 
          title: 'Coffee Dreams',
          artist: 'Local Artist',
          category: 'photography',
          price: 1800,
          image: '/assets/artwork2.jpg',
          description: 'Coffee shop photography',
          isAvailable: true
        }
      ];
      
      res.render('gallery', {
        title: 'Art Gallery - Rabuste Coffee',
        description: 'Discover the vibrant art collection at Rabuste Coffee, where coffee culture meets contemporary art.',
        currentPage: '/gallery',
        keywords: 'art gallery, coffee art, contemporary art, café art collection',
        ogTitle: 'Art Gallery - Rabuste Coffee',
        ogDescription: 'Discover the vibrant art collection at Rabuste Coffee, where coffee culture meets contemporary art.',
        ogType: 'website',
        ogUrl: 'https://rabustecoffee.com/gallery',
        ogImage: '/assets/photowall.jpeg',
        canonicalUrl: 'https://rabustecoffee.com/gallery',
        artworks: staticArtworks
      });
      return;
    }
    
    const artworks = await Artwork.find({ isAvailable: true })
      .sort({ displayOrder: 1, createdAt: -1 });
    
    res.render('gallery', {
      title: 'Art Gallery - Rabuste Coffee',
      description: 'Discover the vibrant art collection at Rabuste Coffee, where coffee culture meets contemporary art.',
      currentPage: '/gallery',
      keywords: 'art gallery, coffee art, contemporary art, café art collection',
      ogTitle: 'Art Gallery - Rabuste Coffee',
      ogDescription: 'Discover the vibrant art collection at Rabuste Coffee, where coffee culture meets contemporary art.',
      ogType: 'website',
      ogUrl: 'https://rabustecoffee.com/gallery',
      ogImage: '/assets/photowall.jpeg',
      canonicalUrl: 'https://rabustecoffee.com/gallery',
      artworks: artworks
    });
  } catch (error) {
    console.error('Gallery route error:', error);
    res.status(500).send('Error loading gallery');
  }
});

// API route for individual artwork details
app.get('/api/artwork/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Looking for artwork with ID:', id);
    
    let artwork;
    
    // Try to find by ObjectId first
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        artwork = await Artwork.findById(id);
        console.log('Tried ObjectId lookup, found:', !!artwork);
      }
    } catch (error) {
      console.log('ObjectId lookup failed:', error.message);
    }
    
    // If not found, try to find by displayOrder (for numeric IDs)
    if (!artwork && !isNaN(parseInt(id))) {
      artwork = await Artwork.findOne({ displayOrder: parseInt(id) });
      console.log('Tried displayOrder lookup, found:', !!artwork);
    }
    
    // If still not found, try to find by title as fallback
    if (!artwork) {
      artwork = await Artwork.findOne({ title: { $regex: id, $options: 'i' } });
      console.log('Tried title lookup, found:', !!artwork);
    }
    
    if (!artwork) {
      console.log('Artwork not found for ID:', id);
      return res.status(404).json({ error: 'Artwork not found' });
    }
    
    console.log('Found artwork:', artwork.title, 'ID:', artwork._id);
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork details:', error);
    res.status(500).json({ error: 'Error fetching artwork details' });
  }
});

// About Us route
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us - Rabuste Coffee",
    description:
      "Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.",
    currentPage: "/about",
    keywords:
      "about Rabuste Coffee, our story, coffee passion, Robusta coffee, café team",
    ogTitle: "About Us - Rabuste Coffee",
    ogDescription:
      "Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.",
    ogType: "website",
    ogUrl: "https://rabustecoffee.com/about",
    ogImage: "/assets/coffee-bg.jpeg",
    canonicalUrl: "https://rabustecoffee.com/about",
    additionalCSS: '<link rel="stylesheet" href="/css/about.css">',
    additionalJS: '<script src="/js/about-animations.js"></script>',
  });
});

// Franchise route
app.get("/franchise", (req, res) => {
  res.render("franchise", {
    title: "Franchise Opportunities - Partner with Rabuste Coffee",
    description:
      "Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support and proven business model. Investment range $75K-$150K.",
    currentPage: "/franchise",
    keywords:
      "coffee franchise, robusta coffee franchise, café franchise opportunities, premium coffee business, franchise investment, coffee shop franchise",
    ogTitle: "Franchise Opportunities - Partner with Rabuste Coffee",
    ogDescription:
      "Join the bold coffee revolution. Premium Robusta-only franchise with proven business model, comprehensive support, and strong ROI potential.",
    ogType: "website",
    ogUrl: "https://rabustecoffee.com/franchise",
    ogImage: "/assets/coffee-bg.jpeg",
    canonicalUrl: "https://rabustecoffee.com/franchise",
    investmentRanges: [
      "$50K - $75K",
      "$75K - $100K",
      "$100K - $150K",
      "$150K - $200K",
      "$200K+",
    ],
  });
});

app.get("/workshops", async (req, res) => {
  console.log("Workshops route accessed");
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("Database not connected, using static data");
      // Return static data if database is not connected
      const staticWorkshops = {
        upcoming: [
          {
            title: "Advanced Coffee Brewing",
            description: "Master the art of precision brewing with advanced techniques. Learn pour-over methods, temperature control, and extraction principles.",
            date: "2026-02-18T10:00:00.000Z",
            type: "upcoming",
            category: "Coffee",
            image: "/assets/workshops/coffee-brewing.jpeg",
            meta: {
              duration: "3 hours",
              level: "Intermediate",
              tags: ["coffee", "brewing", "technique"]
            }
          },
          {
            title: "Modern Calligraphy",
            description: "Create beautiful latte art designs. From basic hearts to advanced rosettas and tulips. Perfect for baristas and coffee enthusiasts.",
            date: "2026-03-15T14:00:00.000Z",
            type: "upcoming",
            category: "Coffee Art",
            image: "/assets/workshops/modern-calligraphy.jpg",
            meta: {
              duration: "2.5 hours",
              level: "Beginner",
              tags: ["Modern Calligraphy", "barista", "design"]
            }
          },
          {
            title: "Watercolor Painting Workshop",
            description: "Explore the fluid beauty of watercolor painting. Learn techniques, color mixing, and create your own masterpiece in a relaxed café setting.",
            date: "2026-04-10T11:00:00.000Z",
            type: "upcoming",
            category: "Art",
            image: "/assets/workshops/watercolor.jpeg",
            meta: {
              duration: "3 hours",
              level: "All Levels",
              tags: ["watercolor", "painting", "art"]
            }
          },
          {
            title: "Beginner Pottery",
            description: "Explore the fluid beauty of pottery. Learn techniques, clay handling, and create your own masterpiece in a relaxed café setting.",
            date: "2026-04-10T11:00:00.000Z",
            type: "upcoming",
            category: "Art",
            image: "/assets/workshops/pottery.jpg",
            meta: {
              duration: "3 hours",
              level: "All Levels",
              tags: ["Beginner Pottery", "clay", "art"]
            }
          }
        ],
        past: [
          {
            title: "Coffee Art Workshop",
            date: "2025-11-20T10:00:00.000Z",
            type: "past",
            category: "Coffee Education",
            description: "Learn about the unique characteristics of Robusta coffee, its flavor profile, and why it's special. Tasting session included.",
            image: "/assets/workshops/coffee_art.jpg",
            meta: {
              duration: "2 hours",
              level: "Beginner",
              tags: ["robusta", "coffee", "tasting"]
            },
            galleryImages: [
              "/assets/workshops/coffee_art-1.jpg",
              "/assets/workshops/coffee_art-2.jpg",
              "/assets/workshops/coffee_art-3.jpg"
            ]
          },
          {
            title: "Lino Cut Art Workshop",
            date: "2025-10-15T14:00:00.000Z",
            type: "past",
            category: "Art",
            description: "Hands-on printmaking workshop where participants created their own prints using simple techniques. Great for beginners!",
            image: "/assets/workshops/printmaking.jpg",
            meta: {
              duration: "3 hours",
              level: "Beginner",
              tags: ["printmaking", "art", "craft"]
            },
            galleryImages: [
              "/assets/workshops/printmaking-1.jpg",
              "/assets/workshops/printmaking-2.jpg",
              "/assets/workshops/printmaking-3.jpg"
            ]
          },
          {
            title: "Ganesha Making Workshop",
            date: "2025-09-25T16:00:00.000Z",
            type: "past",
            category: "Clay Modelling",
            description: "A mindful sculpting experience rooted in tradition",
            image: "/assets/workshops/ganesha-making.jpg",
            meta: {
              duration: "2 hours",
              level: "Intermediate",
              tags: ["Guided Session", "tradition", "Clay Modelling"]
            },
            galleryImages: [
              "/assets/workshops/cupping-1.jpg"
            ]
          }
        ]
      };
      
      console.log("Rendering with static data - upcoming:", staticWorkshops.upcoming.length, "past:", staticWorkshops.past.length);
      
      res.render("workshops", {
        title: "Workshops - Rabuste Coffee",
        description: "Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.",
        currentPage: "/workshops",
        upcomingWorkshops: staticWorkshops.upcoming,
        pastWorkshops: staticWorkshops.past,
        layout: false // Disable layout for this route
      });
      return;
    }
    
    console.log("Database connected, fetching from database");
    const upcomingWorkshops = await WorkshopModel.find({ 
      type: 'upcoming', 
      isActive: true,
    }).sort({ date: 1, displayOrder: 1 });
    
    const pastWorkshops = await WorkshopModel.find({ 
      type: 'past', 
      isActive: true 
    }).sort({ date: -1, displayOrder: 1 });

    console.log("Database results - upcoming:", upcomingWorkshops.length, "past:", pastWorkshops.length);

    res.render("workshops", {
      title: "Workshops - Rabuste Coffee",
      description: "Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.",
      currentPage: "/workshops",
      upcomingWorkshops: upcomingWorkshops,
      pastWorkshops: pastWorkshops,
      layout: false // Disable layout for this route
    });
  } catch (error) {
    console.error('Workshops route error:', error);
    res.status(500).send('Error loading workshops');
  }
});

app.get("/philosophy", (req, res) => {
  res.render("philosophy", {
    title: "The Robusta Philosophy Experience | Rabuste",
    currentPage: "/philosophy",
  });
});

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

// User Dashboard route
app.get('/user-dashboard', ensureAuthenticated, (req, res) => {
  res.render('user-dashboard', {
    title: 'User Dashboard - Rabuste Coffee',
    description: 'Manage your wishlist, cart, workshop registrations, and requests at Rabuste Coffee.',
    currentPage: '/user-dashboard',
    user: req.user,
    currentUser: req.user
  });
});

// API Routes for dynamic data
app.get('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    res.json(user.wishlist || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json([]);
  }
});

app.post('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
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
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    res.json(user.cart || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json([]);
  }
});

app.post('/api/cart', ensureAuthenticated, async (req, res) => {
  try {
    const { itemId, name, price, image, quantity } = req.body;
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItem = user.cart.find(item => item.itemId === itemId);
    if (existingItem) {
      // Update quantity instead of adding duplicate
      existingItem.quantity += (quantity || 1);
      user.markModified('cart');
      await user.save();
      return res.json({ success: true, message: 'Item quantity updated' });
    }

    console.log('User before cart update:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    // Create cart item and add to cart array
    const cartItem = { itemId, name, price, image, quantity: quantity || 1 };
    user.cart.push(cartItem);
    
    console.log('Cart item to add:', cartItem);
    console.log('User cart after push:', user.cart);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    const workshops = await WorkshopModel.find({ userId: req.user.id }).populate('workshopId');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workshops' });
  }
});

app.post('/api/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const { workshopId, workshopName, date } = req.body;
    const registration = new WorkshopModel({
      userId: req.user.id,
      workshopId,
      workshopName,
      date,
      status: 'registered'
    });
    await registration.save();
    res.json({ success: true, item: registration });
  } catch (error) {
    res.status(500).json({ error: 'Error registering for workshop' });
  }
});

app.delete('/api/workshops/:id', ensureAuthenticated, async (req, res) => {
  try {
    await WorkshopModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error canceling workshop registration' });
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
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { itemId, name, price, image, quantity = 1 } = req.body;
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

    // Create cart item and add to cart array
    const cartItem = { itemId, name, price, image, quantity };
    user.cart.push(cartItem);
    
    console.log('Cart item to add:', cartItem);
    console.log('User cart after push:', user.cart);

    // Mark only cart as modified, preserve other fields
    user.markModified('cart');
    await user.save();

    console.log('User after save:', {
      name: user.name,
      email: user.email,
      cartLength: user.cart.length
    });

    res.json({ success: true, message: 'Item added to cart' });
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

    const item = user.cart.find(item => item.itemId === req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      user.cart.pull({ itemId: req.params.itemId });
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
    const User = require('./models/User');
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = user.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create new order
    const newOrder = new Order({
      userId: user._id,
      customerName: user.name || user.displayName,
      customerEmail: user.email,
      items: user.cart.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      totalAmount: totalAmount,
      status: 'pending'
    });

    // Save order
    await newOrder.save();

    // Clear user's cart
    user.cart = [];
    await user.save();

    console.log('Order created:', {
      orderId: newOrder._id,
      customer: user.name || user.displayName,
      email: user.email,
      totalAmount: totalAmount,
      itemCount: newOrder.items.length
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

// Admin: Update order status
app.post('/api/admin/orders/:id/status', ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

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

    console.log('Order status updated:', {
      orderId: order._id,
      newStatus: status,
      customer: order.customerName
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
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

// Import admin routes
const adminRoutes = require('./src/routes/adminRoutes');

// Use admin routes
app.use('/admin', adminRoutes);





app.get("/admin/users", (req, res) => {
  // Mock data - replace with actual database queries
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      joinDate: '2024-01-01',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'customer',
      joinDate: '2024-01-02',
      status: 'active'
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@rabustecoffee.com',
      role: 'admin',
      joinDate: '2023-12-01',
      status: 'active'
    }
  ];
  
  res.render("admin/users", {
    title: 'User Management - Admin Dashboard',
    description: 'Manage user accounts, roles, and permissions.',
    currentPage: '/admin/users',
    users,
    additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
    additionalJS: '<script src="/js/admin.js"></script>'
  });
});

// Admin API routes for handling requests
app.post("/admin/cart-requests/:id/update", adminController.updateCartRequest);

app.post("/admin/workshop-requests/:id/update", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Update workshop request status in database
  console.log(`Updating workshop request ${id} to status: ${status}`);
  res.redirect("/admin/workshop-requests");
});

app.post("/admin/users/:id/update", (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;
  // Update user role/status in database
  console.log(`Updating user ${id} - role: ${role}, status: ${status}`);
  res.redirect("/admin/users");
});

// 404 Handler - Must be after all other routes
// app.use((req, res) => {
//   res.status(404).send('Page Not Found');
// });
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