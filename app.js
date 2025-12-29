const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

app.use(express.static("public"));

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

app.listen(3000, () => console.log("Server running"));
