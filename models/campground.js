const mongoose = require("mongoose");
const Review = require("./review"); // Needed for middleware down below
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
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