const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
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

app.listen(3000, () => console.log("Server running"));
