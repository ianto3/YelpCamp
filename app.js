// By default we're always running in devolopment.
// Load API secrets from .env.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
};

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
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// Avoid MongoDB Operator injections
const mongoSanitize = require('express-mongo-sanitize');
// Another security package
const helmet = require("helmet");


// Import our routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


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
app.use(mongoSanitize());


// creating sessions
const sessionConfig = {
    // For security...
    // Change default cookie name "connect.sid" to avoid predetermined targeting.
    name: "session",
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // For security reasons...
        httpOnly: true,
        // Secure only lets the cookie work under HTTPS.
        // localhost is NOT secure, so it will not work in that setting.
        // Uncomment before deploying.
        // secure: true,
        // Set cookies to expire in a week or else the person could
        // be logged in forever through his device.
        // Date.now() is in milliseconds, converting to week...
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
// Session must come before passport.session()
app.use(session(sessionConfig));

// Must configure contentSecurityPolicy to avoid problems loading backgrounds, maps, etc...
// Specify all sources that we want to allow.
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmpc7jecg/", // Should match our cloudinary name.
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
// For persistent login sessions, use passport.session()
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
// serialize -> how to store a user in a session
passport.serializeUser(User.serializeUser());
// deserialize -> how to get a user out of the session
passport.deserializeUser(User.deserializeUser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// flash middleware
// Under every request we take whatever is in req.flash under success
// and pass it to locals under the key "success".
// This can be accessible for example to partials.
// res.locals -> An object that contains response local variables scoped to 
// the request, and therefore available only to the view(s) rendered during 
// that request / response cycle (if any). Otherwise, this property is identical to app.locals.
// This property is useful for exposing request-level information such as the request path name, 
// authenticated user, user settings, and so on.
app.use((req, res, next) => {
    // req.user is created by passport
    // if not logged in -> undefined
    // if logged in -> user doc from mongo (mongo ID, username and email)
    // console.log(req.user)
    res.locals.currentUser = req.user;
    // req.originalUrl has the full path to the last url visited
    // save in session (for statefulness) where the user was before redirecting
    // to login, to be able to return him where he was afterwards
    // If user didn't come directly from login or home page, save last url visited.
    if (!["/login", "/register", "/"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl
    };
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Establish our routes
// Note: the routes must come AFTER the above session code and flash
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


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
    const { statusCode = 500, message = "Something went wrong!" } = err;
    if (!err.message) err.message = "Oops, Something went wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log("Listening...");
});