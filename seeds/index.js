const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers")

mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Mongoose Activated!");
    })
    .catch((err) => {
        console.log("Oh oh...");
        console.log(err);
    });

// Seed online DB
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config();
// };

// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });

// get a random element from an array
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];



// Check if we are able to connect to db and create entries
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: "60784ebf88a4402b3dbb2404",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                url: "https://res.cloudinary.com/dmpc7jecg/image/upload/v1618589086/YelpCamp/mei3ssl0yrbd1wfc3mka.jpg",
                filename: "YelpCamp/mei3ssl0yrbd1wfc3mka"
            },
            {
                url: "https://res.cloudinary.com/dmpc7jecg/image/upload/v1618589090/YelpCamp/lghtmb3azz9bkn1vevyg.jpg",
                filename: "YelpCamp/lghtmb3azz9bkn1vevyg"
            },
            {
                url: "https://res.cloudinary.com/dmpc7jecg/image/upload/v1618589097/YelpCamp/sb7bpkeqdmwzcxrlk1hh.jpg",
                filename: "YelpCamp / sb7bpkeqdmwzcxrlk1hh"
            },
            {
                url: "https://res.cloudinary.com/dmpc7jecg/image/upload/v1618589098/YelpCamp/ht6ir6gv4uqea7vj4hbg.jpg",
                filename: "YelpCamp / ht6ir6gv4uqea7vj4hbg"
            }],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus voluptates voluptas?',
            price
        });
        await camp.save();
    };
}

// create db and close connection
// async function so we can use "then"
seedDB().then(() => {
    mongoose.connection.close();
});