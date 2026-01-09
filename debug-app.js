const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

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

app.get("/signin", (req, res) => {
  console.log("Sign in route handler called");
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
  console.log("Sign up route handler called");
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

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).send(`Route not found: ${req.method} ${req.path}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Debug server running on port ${port}`);
  console.log("Registered routes:");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    }
  });
});