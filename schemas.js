const Joi = require("joi");

// joi schema
const campgroundSchema = Joi.object({
    // we create a nested object campground since in req.body
    // we were adding the inputs in a campground object
    // check the forms
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.campgroundSchema = campgroundSchema;

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required() // add required, we want the whole thing required
})