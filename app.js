const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);

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
    canonicalUrl: 'https://rabustecoffee.com',
    layout: 'layouts/main'
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
    additionalJS: '<script src="/js/about-animations.js"></script>',
    layout: 'layouts/main'
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
    ],
    layout: 'layouts/main'
  });
});

// 404 Handler - Must be after all other routes
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found - Rabuste Coffee',
    currentPage: '/404',
    description: 'The page you are looking for does not exist.',
    layout: 'layouts/main'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Something went wrong - Rabuste Coffee',
    message: 'We\'re experiencing some technical difficulties. Please try again later.',
    layout: 'layouts/main'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
