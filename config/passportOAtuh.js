const passport = require('passport');
const userModel = require('../models/users');
const OAuthStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
require('dotenv').config();
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
passport.use(new OAuthStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.callbackURL,
    // passReqToCallback   : true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
    try {
        const email = profile.emails[0].value;
        let user = await userModel.findOne({email: email});
        if(user){
            return done(null,user)
        }else{
            // create a user
            user = new userModel({
                name: profile.name,
                email: email,
                password: crypto.randomBytes(20).toString('hex'),
                gender: profile.gender,
                dateOfBirth: profile.birthday
            });
            await user.save();
            return done(null,user);
        }        
    } catch (error) {
        console.log("Google Oauth Failed",error);
        return done(error,null);
    }
  }
));