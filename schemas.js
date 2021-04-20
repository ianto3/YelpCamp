const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

// Added for security reasons.
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // Needs npm package sanitize-html
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// We add previously created extension to joi.
const Joi = BaseJoi.extend(extension);

// joi schema
const campgroundSchema = Joi.object({
    // we create a nested object campground since in req.body
    // we were adding the inputs in a campground object
    // check the forms
    campground: Joi.object({
        // .escapeHTML has been set with the extension created at the beginning of the file.
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.campgroundSchema = campgroundSchema;

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required() // add required, we want the whole thing required
})