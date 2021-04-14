const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const wrapAsync = require("./utils/WrapAsync");
const expressError = require("./utils/ExpressError");
// Joi helps handle validation before passing it to mongoose or others
// It also helps create meaningful errors
// Joi's import has been commented out, we import it through the next schemas file
// const Joi = require("joi");
// destructure since we might have multiple schemas in the file
const { campgroundSchema, reviewSchema } = require("./schemas");
const { findById } = require("./models/campground");
const Review = require("./models/review");


mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
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


// Test Joi validation via postman to!
// URL-encoded is validated via our html setup but you could
// still post information via other routes
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        //error.details is an array of objects, we need to map it and 
        // create a single string message
        const message = error.details.map(el => el.message).join(",");
        throw new expressError(message, 400);
    }
    else {
        // crucial to call next to pass to next functions in router
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        //error.details is an array of objects, we need to map it and 
        // create a single string message
        const message = error.details.map(el => el.message).join(",");
        throw new expressError(message, 400);
    }
    else {
        // crucial to call next to pass to next functions in router
        next();
    }
}



app.get("/", (req, res) => {
    res.render("home");
});


// CAMPGROUNDS

app.get("/campgrounds", wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

// Create a new campground
// render a form
// note: app.get("/campgrounds/new") must be placed before app.get("/campgrounds/:id" in script
// or else it will think "new" IS an id...order matters here
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.post("/campgrounds", validateCampground, wrapAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}));

// Show a campground
app.get("/campgrounds/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
}));

// Edit a campground
app.get("/campgrounds/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id));
    res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}));

// Delete a campground
app.delete("/campgrounds/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    // When deleting, a middleware created in the campgrounds model
    // deletes all reviews linked to the campground.
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));


// REVIEWS

app.post("/campgrounds/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    const reviewsaved = await review.save();
    const campgroundsaved = await campground.save();
    console.log(reviewsaved, campgroundsaved);
    res.redirect(`/campgrounds/${id}`);
}));

app.delete("/campgrounds/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

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