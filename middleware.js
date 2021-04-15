const { campgroundSchema, reviewSchema } = require("./schemas");
const expressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

// User middleware
module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() is a method from passport.
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in!");
        return res.redirect("/login");
    }
    next();
};

// Campground middleware
// Test Joi validation via postman to!
// URL-encoded is validated via our html setup but you could
// still post information via other routes
module.exports.validateCampground = (req, res, next) => {
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

module.exports.verifyAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        // User return or the statements after this conditional will still run.
        return res.redirect(`/campgrounds/${id}`)
    };
    next();
};

// Review middleware
module.exports.validateReview = (req, res, next) => {
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
};

module.exports.verifyReviewAuthor = async (req, res, next) => {
    // reviewId instead of id, check review routes.
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        // User return or the statements after this conditional will still run.
        return res.redirect(`/campgrounds/${id}`)
    };
    next();
};