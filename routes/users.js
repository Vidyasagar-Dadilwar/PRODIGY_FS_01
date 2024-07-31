const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    return res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      errors.push({ msg: "Email already exists" });
      return res.render("register", {
        errors,
        name,
        email,
        password,
        password2,
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user
    await newUser.save();
    req.flash("success_msg", "You are now registered and can log in");
    res.redirect("/users/login");
  } catch (err) {
    console.error("Error during user registration:", err);
    errors.push({ msg: "Something went wrong. Please try again." });
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;