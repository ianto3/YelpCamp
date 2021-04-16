// Controller file for campgrounds.
// A controller is responsible for controlling the way that a user interacts 
// with an MVC (Models, Views and Controllers) application.

const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    // Save a reference to the author who created the campground.
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // We populate campgrounds reviews (and their authors) and the author of the campground
    const campground = await (await Campground.findById(id).populate({
        // nested populate, we populate the reviews and inside them we populate their authors.
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author"));
    // just in case you access a url to a specific campground that doesn't
    // exist anymore, handle the problem
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    };
    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id));
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    };
    res.render("campgrounds/edit", { campground });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Successfully updated a campground!");
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    // When deleting, a middleware created in the campgrounds model
    // deletes all reviews linked to the campground.
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds");
}