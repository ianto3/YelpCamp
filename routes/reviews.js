const express = require("express");
// Add option mergeParams to pass through /:id from campgrounds routes
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync");
const reviews = require("../controllers/reviews");
// const expressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, verifyReviewAuthor } = require("../middleware");


// REVIEWS

router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviews.createReview));

// verifyReviewAutho is importante to avoid deleting comments via postman or such.
// We don't show the delete button but you could still access the route via other methods.
router.delete("/:reviewId",
    isLoggedIn,
    verifyReviewAuthor,
    wrapAsync(reviews.deleteReview));

module.exports = router;