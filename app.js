const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require('mongoose');

require("dotenv").config();
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Models
const User = require('./models/User');
const Wishlist = require('./models/Wishlist');
const Cart = require('./models/Cart');
const Workshop = require('./models/Workshop');
const Request = require('./models/Request');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false
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

// Menu route - Serve static HTML for now, can be converted to EJS later
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/menu.html'), {
    title: 'Our Menu - Rabuste Coffee',
    description: 'Explore our premium Robusta coffee menu, artisanal drinks, and delicious food pairings at Rabuste Coffee.',
    currentPage: '/menu',
    layout: false
  });
});

// Gallery route - Serve static HTML for now, can be converted to EJS later
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/gallery.html'), {
    title: 'Art Gallery - Rabuste Coffee',
    description: 'Discover the vibrant art collection at Rabuste Coffee, where coffee culture meets contemporary art.',
    currentPage: '/gallery',
    layout: false
  });
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

app.get('/workshops', (req, res) => {
  res.render('workshops');
});

app.get("/signin", (req, res) => {
  res.render("signin", {
    additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`
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
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.post("/signin", (req, res) => {
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`
  });
});

app.post("/signup", (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).render("signup", {
      additionalCSS: `<link rel="stylesheet" href="/css/auth.css">`,
      error: "Passwords do not match."
    });
  }

  res.redirect("/signin");
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

// API Routes for dynamic data
app.get('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user.id }).populate('artId');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wishlist' });
  }
});

app.post('/api/wishlist', ensureAuthenticated, async (req, res) => {
  try {
    const { artId, title, artist, price, image } = req.body;
    const wishlistItem = new Wishlist({
      userId: req.user.id,
      artId,
      title,
      artist,
      price,
      image
    });
    await wishlistItem.save();
    res.json({ success: true, item: wishlistItem });
  } catch (error) {
    res.status(500).json({ error: 'Error adding to wishlist' });
  }
});

app.delete('/api/wishlist/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error removing from wishlist' });
  }
});

app.get('/api/cart', ensureAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.user.id }).populate('menuItemId');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

app.post('/api/cart', ensureAuthenticated, async (req, res) => {
  try {
    const { menuItemId, name, price, image, quantity } = req.body;
    const cartItem = new Cart({
      userId: req.user.id,
      menuItemId,
      name,
      price,
      image,
      quantity: quantity || 1
    });
    await cartItem.save();
    res.json({ success: true, item: cartItem });
  } catch (error) {
    res.status(500).json({ error: 'Error adding to cart' });
  }
});

app.delete('/api/cart/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error removing from cart' });
  }
});

app.get('/api/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const workshops = await Workshop.find({ userId: req.user.id }).populate('workshopId');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workshops' });
  }
});

app.post('/api/workshops', ensureAuthenticated, async (req, res) => {
  try {
    const { workshopId, workshopName, date } = req.body;
    const registration = new Workshop({
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
    await Workshop.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
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

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// 404 Handler - Must be after all other routes
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
