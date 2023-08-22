const { error } = require('console');
const userModel = require('../models/users');
const AppError = require('../utils/errorClass');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsyncError');

//Session verification
module.exports.checkAuthorization = function(req,res,next){
    //console.log(req.session);
    if(!(req.session && req.session.authorized===true)){
        return res.redirect('/authentication/sign-in/page');
    }
    return next();    
}

module.exports.createSession = function(req,res,next){
        req.session.user = req.user;
        req.session.authorized = true;
        next();
}

module.exports.setUserOnLocals = async (req,res,next)=>{
    if((req.session && req.session.user && req.session.authorized===true)){
        const user = await userModel.findById(req.session.user);
        res.locals.user = user.name;
    }
    next();
}

// JWT verification
module.exports.protect = catchAsync(async function(req,res,next){
    let token;
    // Check if the req sent contains token in the headers or not
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
       token = req.headers.authorization.split(' ')[1]; 
    }
    if(!token){
        next(new AppError(401,"Please sign in first!"))
    }
    // Verify the token is correct or not
    const verify = promisify(jwt.verify);
    const decoded = await verify(token,process.env.JWT_SECRET);
    // Check if the user exists
    const freshUser = await userModel.findById(decoded.id);
    if(!freshUser){
        return next(new AppError(401,"User belonging to this token no longer exists!"));
    }

    // Check if the password was changed after the token was issued
    if(freshUser.checkPasswordChanged(decoded.iat)){
        return next(new AppError(401, "Invalid Token, Please Login again"));
    }

    req.jwtuser = freshUser;

    next();
})


module.exports.setFlash = function(req,res,next){
    res.locals.flash = {
        success : req.flash('success'),
        error: req.flash('error')
    }
    next();
}