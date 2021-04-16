const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // Once registered, we automatically log in the new user.
        req.login(registeredUser, err => {
            // req.login() is built into passport and we must write it as is.
            // We return the error if there is one to handle it with our error handling.
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    };
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.authenticate = (req, res) => {
    req.flash("success", "Welcome!");
    // Get last url visited before logging in or just campgrounds if the user directly logged in at arrival.
    // We stored this information in session with our middleware to res.locals.
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    // logout is a builtin method from passports
    req.logout();
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
}