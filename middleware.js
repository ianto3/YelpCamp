const isLoggedIn = (req, res, next) => {
    // isAuthenticated() is a method from passport.
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in!");
        return res.redirect("/login");
    }
    next();
};

module.exports = isLoggedIn;