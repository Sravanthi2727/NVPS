const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();
const path = require('path');

const app = express();

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

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Admin routes
app.get("/admin", (req, res) => {
  res.render("admin/dashboard", {
    title: 'Admin Dashboard - Rabuste Coffee',
    description: 'Admin dashboard for managing cart requests, workshop requests, and user accounts.',
    currentPage: '/admin',
    additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
    additionalJS: '<script src="/js/admin.js"></script>'
  });
});

app.get("/admin/cart-requests", (req, res) => {
  // Mock data - replace with actual database queries
  const cartRequests = [
    {
      id: 1,
      customerName: 'John Doe',
      email: 'john@example.com',
      items: ['Robusta Blend', 'Espresso Shot'],
      total: 25.50,
      status: 'pending',
      date: '2024-01-08'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      email: 'jane@example.com',
      items: ['Cold Brew', 'Pastry'],
      total: 18.75,
      status: 'completed',
      date: '2024-01-07'
    }
  ];
  
  res.render("admin/cart-requests", {
    title: 'Cart Requests - Admin Dashboard',
    description: 'Manage customer cart requests and orders.',
    currentPage: '/admin/cart-requests',
    cartRequests,
    additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
    additionalJS: '<script src="/js/admin.js"></script>'
  });
});

app.get("/admin/workshop-requests", (req, res) => {
  // Mock data - replace with actual database queries
  const workshopRequests = [
    {
      id: 1,
      customerName: 'Alice Johnson',
      email: 'alice@example.com',
      workshop: 'Coffee Brewing Basics',
      date: '2024-01-15',
      participants: 2,
      status: 'pending',
      requestDate: '2024-01-08'
    },
    {
      id: 2,
      customerName: 'Bob Wilson',
      email: 'bob@example.com',
      workshop: 'Latte Art Masterclass',
      date: '2024-01-20',
      participants: 1,
      status: 'approved',
      requestDate: '2024-01-07'
    }
  ];
  
  res.render("admin/workshop-requests", {
    title: 'Workshop Requests - Admin Dashboard',
    description: 'Manage workshop booking requests and schedules.',
    currentPage: '/admin/workshop-requests',
    workshopRequests,
    additionalCSS: '<link rel="stylesheet" href="/css/admin.css">',
    additionalJS: '<script src="/js/admin.js"></script>'
  });
});

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
app.post("/admin/cart-requests/:id/update", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Update cart request status in database
  console.log(`Updating cart request ${id} to status: ${status}`);
  res.redirect("/admin/cart-requests");
});

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
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
