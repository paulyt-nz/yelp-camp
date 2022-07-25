const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true, 
    // useCreateIndex: true,
    // NOT REALLY SURE WHY THESE ONES WONT WORK
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
     await Campground.deleteMany({});
     for (let i=0; i < 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62cfda8423913247942ed12e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { 
              type: 'Point', 
              coordinates: [ 
                cities[random1000].longitude, 
                cities[random1000].latitude
              ] 
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, repudiandae. Nisi dolores deserunt laborum autem eius quia repellendus iste dolor minus, beatae excepturi at sapiente, dolorem pariatur quisquam illo harum?',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dj3kdxlaw/image/upload/v1658279560/YelpCamp/rn51jnxkqgzywy7bmr1c.jpg',
                  filename: 'YelpCamp/rn51jnxkqgzywy7bmr1c',
                },
                {
                  url: 'https://res.cloudinary.com/dj3kdxlaw/image/upload/v1658279561/YelpCamp/rso5w4q5yyra9960dumy.jpg',
                  filename: 'YelpCamp/rso5w4q5yyra9960dumy',
                }
              ],
             
        })
        await camp.save();
     }
}

seedDB().then(() => {
    mongoose.connection.close();
});