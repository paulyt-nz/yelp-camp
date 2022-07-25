const User = require('../models/user');

module.exports.renderRegister = (req,res) => {
    console.log('------------------------------')
    console.log('hitting renderRegister get route')
    console.log('------------------------------')
    res.render('users/register')
};

 module.exports.register = async (req,res) => {
    console.log('------------------------------')
    console.log('hitting register post route')
    console.log('------------------------------')
    try{
        const {email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (e) => {
            if(e){
                return next(e);
            } else {
                req.flash('success', 'Welcome to Yelp Camp!');
                res.redirect('/campgrounds');
            }
        })
        
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.renderLogin = (req,res) => {
    console.log('------------------------------')
    console.log('hitting login get route')
    console.log('------------------------------')
    res.render('users/login');
};

module.exports.login = (req,res) => {
    console.log('------------------------------')
    console.log('hitting login post route')
    console.log('------------------------------')
    console.log('req.session.returnTo is:  ', req.session.returnTo)
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log('checking req.session:   ', req.session)
    
    console.log('redirectUrl:', redirectUrl)
    //delete req.session.returnTo; // cant get it to save a returnTo so have just turned it off for now
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res) => {
    console.log('------------------------------')
    console.log('hitting logout route')
    console.log('------------------------------')
    req.logout((e) => {
        if (e) { 
            return next(e); 
        } else {
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
        }})
};