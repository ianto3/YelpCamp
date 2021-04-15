const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync");
// const mongoose = require("mongoose");
const expressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const isLoggedIn = require("../middleware");

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



// CAMPGROUNDS

router.get("/", wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

// Create a new campground
// render a form
// note: router.get("/campgrounds/new") must be placed before router.get("/campgrounds/:id" in script
// or else it will think "new" IS an id...order matters here

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// isLoggedIn here protects the route from postman or something that's not the web's form
router.post("/", isLoggedIn, validateCampground, wrapAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
}));

// Show a campground
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    // just in case you access a url to a specific campground that doesn't
    // exist anymore, handle the problem
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    };
    res.render("campgrounds/show", { campground });
}));

// Edit a campground
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id));
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    };
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", isLoggedIn, validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Successfully updated a campground!");
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}));

// Delete a campground
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    // When deleting, a middleware created in the campgrounds model
    // deletes all reviews linked to the campground.
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

module.exports = router;