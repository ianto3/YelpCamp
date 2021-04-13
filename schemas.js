const Joi = require("joi");

// joi schema
const campgroundSchema = Joi.object({
    // we create a nested object campground since in req.body
    // we were adding the inputs in a campground object
    // check the forms
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.campgroundSchema = campgroundSchema;