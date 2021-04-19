const mongoose = require("mongoose");
const Review = require("./review"); // Needed for middleware down below
const Schema = mongoose.Schema;

// We will nest ImageSchema in CampgroundSchema and create a virtual.
// A virtual is a property not stored in MongoDB. It's accessed as any
// other property of  the schema, in this case, campground.images.thumbnail.
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
    // Inserting w_200 in cloudinary links gives us a picture 200px wide.
    return this.url.replace("/upload", "/upload/w_200");
});

// To include virtuals in res.json()...
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    // Set up GEOJSON with mongoose for mapbox
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    // Inserting w_200 in cloudinary links gives us a picture 200px wide.
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>`;
});

// By creating a middleware we can use it to delete all orphan
// reviews in the document. In mongo docs check the function
// used in the app to delete a campground and to which query
// function it calls. That must be used for the middleware.
// Since we use findByIdAndDelete, it triggers findOneAndDelete.

// Once deleting a campground, the campground is passed on to the
// middleware.

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // We  check if a document was deleted. You could give an order
    // to delete a doc but if it didn't exist, nothing was really 
    // deleted. It wouldn't appear here.
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);