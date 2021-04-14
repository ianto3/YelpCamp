const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const expressError = require("./utils/ExpressError");
// Joi helps handle validation before passing it to mongoose or others
// It also helps create meaningful errors
// Joi's import has been commented out, we import it through the schema files
// in routes.
// const Joi = require("joi");

// Import our routes
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        console.log("Mongoose Activated!");
    })
    .catch((err) => {
        console.log("Oh oh...");
        console.log(err);
    });


// tell express we want to use ejs-mate
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// creating sessions
const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // For security reasons...
        httpOnly: true,
        // Set cookies to expire in a week or else the person could
        // be logged in forever through his device.
        // Date.now() is in milliseconds, converting to week...
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// flash middleware
// Under every request we take whatever is in req.flash under success
// and pass it to locals under the key "success".
// boilertemplate
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Establish our routes
// Note: the routes must come AFTER the above session code and flash

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
    res.render("home");
});


// For every single kind of request and for every path...
// it will only run if nothing before matched, the order is important
app.all("*", (req, res, next) => {
    next(new expressError("Page Not Found", 404));
});

// Error handling
app.use((err, req, res, next) => {
    console.dir(err);
    const { statusCode = 500, message = "Something went wrong!" } = err;
    if (!err.message) err.message = "Oops, Something went wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log("Listening...");
});