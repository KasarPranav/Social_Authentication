const routers = require('express').Router();
const authController = require('../controllers/authController');
const customMiddleware = require('../middleware/customMiddleware');

//Routes for authentication using sessions
routers.use(customMiddleware.setUserOnLocals);
routers.use('/authentication',require('./authentication'));

// Protected route via session based authentication
routers.get('/',customMiddleware.checkAuthorization,authController.homePage);

// Protected route via jwt token
routers.get('/profile',customMiddleware.protect,authController.profile);

// Routes for Password reset
routers.post('/forgotPassword',authController.forgotPassword);
routers.get('/forgotPasswordPage',authController.forgotPasswordPage);
routers.get('/resetPasswordPage/:token',authController.resetPasswordPage);
routers.post('/resetPassword/:token',authController.resetPassword);


module.exports = routers;