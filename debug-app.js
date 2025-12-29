const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

app.use(express.static("public"));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  console.log("Home route handler called");
  res.render("home", {
    coffeeMenu: [
      { title: "Bold Robusta", price: 120, image: "/assets/logo-icon.png" },
      { title: "Dark Shot", price: 150, image: "/assets/logo-icon.png" }
    ]
  });
});

// Franchise page route
app.get("/franchise", (req, res) => {
  console.log("Franchise route handler called");
  res.render("franchise", {
    title: "Franchise Opportunities - Partner with Rabuste Coffee",
    description: "Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and $75K-$150K investment range. Apply today.",
    keywords: "coffee franchise, robusta coffee franchise, cafe franchise opportunities, premium coffee business, franchise investment, coffee shop franchise, artisanal coffee franchise",
    ogTitle: "Franchise Opportunities - Partner with Rabuste Coffee",
    ogDescription: "Join the bold coffee revolution. Premium Robusta-only franchise with proven business model, comprehensive support, and strong ROI potential. Investment from $75K-$150K.",
    ogType: "website",
    ogUrl: "https://rabustecoffee.com/franchise",
    ogImage: "/assets/coffee-bg.jpeg",
    canonicalUrl: "https://rabustecoffee.com/franchise",
    investmentRanges: [
      "$50K - $75K",
      "$75K - $100K", 
      "$100K - $150K",
      "$150K - $200K",
      "$200K+"
    ]
  });
});

// About Us page route
app.get("/about", (req, res) => {
  console.log("About route handler called");
  try {
    res.render("about", {
      title: "About Us - Rabuste Coffee Franchise",
      description: "Learn about Rabuste Coffee franchise benefits, business model, brand support, and partner qualifications.",
      keywords: "about rabuste coffee, franchise benefits, business model, brand support, partner qualifications"
    });
    console.log("About template rendered successfully");
  } catch (error) {
    console.error("Error in about route:", error);
    res.status(500).send("Error: " + error.message);
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).send(`Route not found: ${req.method} ${req.path}`);
});

app.listen(3000, () => {
  console.log("Debug server running on port 3000");
  console.log("Registered routes:");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    }
  });
});