const express = require("express");
const router = express.Router();
// const User = require("../models/user");
const wrapAsync = require("../utils/WrapAsync");
const users = require("../controllers/users");
const passport = require("passport");

router.route("/login")
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        users.authenticate);

router.get("/logout", users.logout);

router.route("/register")
    .get(users.renderRegisterForm)
    .post(wrapAsync(users.register));

module.exports = router;