const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    console.log('------------------------------')
    console.log('hitting index - campground.index')
    console.log('------------------------------')
    const campgrounds = await Campground.find({});
    //console.log(campgrounds)
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    console.log('------------------------------')
    console.log('hitting renderNewForm')
    console.log('------------------------------')
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    console.log('------------------------------')
    console.log('hitting createCampground post route')
    console.log('------------------------------')
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry;
    campground.images = req.files.map((f) => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    console.log('------------------------------')
    console.log('hitting showCampground route')
    console.log('------------------------------')
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', "Couldn't find that campground soz");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    console.log('------------------------------')
    console.log('hitting renderEditForm')
    console.log('------------------------------')
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground) {
        req.flash('error', "Couldn't find that campground soz");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    console.log('------------------------------')
    console.log('hitting updateCampground put route')
    console.log('------------------------------')
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    console.log('imgs: ', imgs)
    campground.images.push(...imgs);
    console.log(campground.images)
    await campground.save();
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
        console.log('------------------------------')
        console.log(campground)
        console.log('------------------------------')
    }
    req.flash('success', 'Successfully edited a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    console.log('------------------------------')
    console.log('hitting campground delete route')
    console.log('------------------------------')
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds')
}