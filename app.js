const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();
const path = require('path');

// Database connection
const connectDB = require('./config/database');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Artwork = require('./models/Artwork');
const Workshop = require('./models/Workshop');

// Connect to database
connectDB();

const app = express();

// Passport serialization/deserialization
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
          // Update user if they're logging in via OAuth
          if (!user.isOAuthUser) {
            user.isOAuthUser = true;
            await user.save();
            console.log('Updated user to OAuth user');
          }
          console.log('Returning user to passport:', user.email);
          return done(null, user);
        } else {
          console.log('Creating new user from Google profile');
          // Create new user from Google profile
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

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax"   // THIS FIXES GOOGLE OAUTH
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

// Home route
app.get('/', (req, res) => {
  res.render('home', { 
    title: 'Rabuste Coffee - Premium Robusta Coffee & Art',
    description: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
    currentPage: '/',
    keywords: 'premium robusta coffee, art café, coffee shop, coffee and art, Rabuste Coffee',
    ogTitle: 'Rabuste Coffee - Premium Robusta Coffee & Art',
    ogDescription: 'Experience the bold taste of premium Robusta coffee in our art-filled café. Join us for workshops, exhibitions, and the best coffee in town.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com'
  });
});

// Menu route - Dynamic
app.get('/menu', async (req, res) => {
  try {
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

// About Us route
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us - Rabuste Coffee',
    description: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
    currentPage: '/about',
    keywords: 'about Rabuste Coffee, our story, coffee passion, Robusta coffee, café team',
    ogTitle: 'About Us - Rabuste Coffee',
    ogDescription: 'Learn about Rabuste Coffee - our story, leadership team, and our passion for Robusta coffee and art.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com/about',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com/about',
    additionalCSS: '<link rel="stylesheet" href="/css/about.css">',
    additionalJS: '<script src="/js/about-animations.js"></script>'
  });
});

// Franchise route
app.get('/franchise', (req, res) => {
  res.render('franchise', {
    title: 'Franchise Opportunities - Partner with Rabuste Coffee',
    description: 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support and proven business model. Investment range $75K-$150K.',
    currentPage: '/franchise',
    keywords: 'coffee franchise, robusta coffee franchise, café franchise opportunities, premium coffee business, franchise investment, coffee shop franchise',
    ogTitle: 'Franchise Opportunities - Partner with Rabuste Coffee',
    ogDescription: 'Join the bold coffee revolution. Premium Robusta-only franchise with proven business model, comprehensive support, and strong ROI potential.',
    ogType: 'website',
    ogUrl: 'https://rabustecoffee.com/franchise',
    ogImage: '/assets/coffee-bg.jpeg',
    canonicalUrl: 'https://rabustecoffee.com/franchise',
    investmentRanges: [
      '$50K - $75K',
      '$75K - $100K',
      '$100K - $150K',
      '$150K - $200K',
      '$200K+'
    ]
  });
});

app.get('/workshops', async (req, res) => {
  try {
    const upcomingWorkshops = await Workshop.find({ 
      type: 'upcoming', 
      isActive: true,
      date: { $gte: new Date() }
    }).sort({ date: 1, displayOrder: 1 });
    
    const pastWorkshops = await Workshop.find({ 
      type: 'past', 
      isActive: true 
    }).sort({ date: -1, displayOrder: 1 });

    res.render('workshops', {
      title: 'Workshops - Rabuste Coffee',
      description: 'Join our creative workshops at Rabuste Coffee - where creativity meets caffeine.',
      currentPage: '/workshops',
      upcomingWorkshops: upcomingWorkshops,
      pastWorkshops: pastWorkshops
    });
  } catch (error) {
    console.error('Workshops route error:', error);
    res.status(500).send('Error loading workshops');
  }
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
    error: error
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
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
    // layout : false,
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

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
