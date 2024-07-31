const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const app = express();


require("./config/passport")(passport);
// Database Config
const db = "YOUR MONGO URI";

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// EJS
app.set("view engine", "ejs");
// app.set("views", path.join("/views/", "views"));

// Bodyparser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "QJdAsGNbIpWkeXxPr4SlWhBjLK3Y7CmP",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: db }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
