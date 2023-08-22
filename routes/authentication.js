const routers = require('express').Router();
const authController = require('../controllers/authController');
const customMiddleware = require('../middleware/customMiddleware');
const passport = require('passport');

routers.get('/sign-in/page',authController.checkIfAlreadyAuthenticated,authController.signinPage);
routers.get('/sign-up/page',authController.checkIfAlreadyAuthenticated,authController.signupPage);

routers.post('/sign-in/check',authController.signin);
routers.post('/sign-up/create',authController.signup);
routers.get('/logout',authController.logout);

//Google authentication routes 
routers.get('/auth/google',passport.authenticate('google',{scope: ['profile','email']}));
routers.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/authentication/sign-in/page'}),[customMiddleware.createSession,customMiddleware.setUserOnLocals,authController.homePage]);





module.exports = routers;