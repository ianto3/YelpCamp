const express = require("express");
// Add option mergeParams to pass through /:id from campgrounds routes
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync");
const expressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas");



// Test Joi validation via postman to!
// URL-encoded is validated via our html setup but you could
// still post information via other routes


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
};


// REVIEWS

router.post("/", validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created a new review!");
    res.redirect(`/campgrounds/${id}`);
}));

router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;