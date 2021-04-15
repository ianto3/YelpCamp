const express = require("express");
// Add option mergeParams to pass through /:id from campgrounds routes
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync");
// const expressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, verifyReviewAuthor } = require("../middleware");


// REVIEWS

router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    // Save who created the review.
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created a new review!");
    res.redirect(`/campgrounds/${id}`);
}));

// verifyReviewAutho is importante to avoid deleting comments via postman or such.
// We don't show the delete button but you could still access the route via other methods.
router.delete("/:reviewId", isLoggedIn, verifyReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;