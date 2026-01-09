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
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

app.use(express.static("public"));

// const artRoutes = require("./routes/art");
// app.use("/art", artRoutes);


app.get("/", (req, res) => {
  res.render("home", {
    coffeeMenu: [
      { title: "Bold Robusta", price: 120, image: "/assets/logo-icon.png" },
      { title: "Dark Shot", price: 150, image: "/assets/logo-icon.png" }
    ]
  });
});

// Franchise page route
app.get("/franchise", (req, res) => {
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
  res.render("about", {
    title: "About Us - Rabuste Coffee",
    description: "Learn about Rabuste Coffee - our story, leadership team, development team, and franchise opportunities.",
    keywords: "about rabuste coffee, team, founders, developers, franchise, coffee company",
    additionalCSS: `<link rel="stylesheet" href="/css/about.css">`,
    additionalJS: `<script src="/js/about-animations.js"></script>`
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
