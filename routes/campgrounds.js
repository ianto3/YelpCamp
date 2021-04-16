const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync");
// const mongoose = require("mongoose");
const campgrounds = require("../controllers/campgrounds");
const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, verifyAuthor, } = require("../middleware");
// const campground = require("../models/campground");


// CAMPGROUNDS

router.route("/")
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn,
        validateCampground,
        wrapAsync(campgrounds.createCampground));

// note: router.get("/campgrounds/new") must be placed before router.get("/campgrounds/:id" in script
// or else it will think "new" IS an id...order matters here
router.get("/new",
    isLoggedIn,
    campgrounds.renderNewForm);

router.route("/:id")
    .get(wrapAsync(campgrounds.showCampground))
    // isLoggedIn here protects the route from postman or something that's not the web's form
    .put(isLoggedIn,
        verifyAuthor,
        validateCampground,
        wrapAsync(campgrounds.editCampground))
    .delete(isLoggedIn,
        verifyAuthor,
        wrapAsync(campgrounds.deleteCampground));

router.get("/:id/edit",
    isLoggedIn,
    verifyAuthor,
    wrapAsync(campgrounds.renderEditForm));

module.exports = router;