// C:/Users/pdtho/Documents/Coding/YelpCamp

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { campgroundSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


const User = require('./models/user')
const Campground = require('./models/campground');
const Review = require('./models/review');
//const campground = require('./models/campground');

const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');

// MONGO ATLAS DATABASE
//const dbUrl = process.env.DB_URL

// Local Host DB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    // useNewUrlParser: true, 
    // useCreateIndex: true,
    /* NOT REALLY SURE WHY THESE ONES WONT WORK
       think they might have been dropped       */
    useUnifiedTopology: true,
    //useFindAndModify: false  *** not sure if this is needed I am not getting the warning so wont bother
});

// //NEED TO LOOK UP WTF THIS SHIT IS
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(flash());
app.use(mongoSanitize());
// app.use(
//     helmet({
//       contentSecurityPolicy: false,
//     })
//   );
// this seems to be breaking something so I will leave it out for now

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = MongoStore.create(
    {
        mongoUrl: dbUrl,
        secret,
        touchAfter: 24 * 60 *60,
    }
)
store.on('error', function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   // a week from NOW
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log('------------------------------')
    console.log('hitting app.use for res.locals additions')
    console.log('------------------------------')
    //console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    console.log('------------------------------')
    console.log('hitting homepage get route')
    console.log('------------------------------')
    res.render('home');
})

app.all('*', (req, res, next) => {
    console.log('------------------------------')
    console.log('hitting app.all route....')
    console.log('------------------------------')
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    console.log('------------------------------')
    console.log('hitting error handling route');
    console.log('------------------------------')
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Oh No! Something Went Wrong!"
    }
   res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})