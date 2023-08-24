const userModel = require('../models/users');
const resetModel = require('../models/resetPassword')
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsyncError');
// const AppError = require('../utils/errorClass');
require('dotenv').config();
const crypto = require('crypto');
const createMail = require('../utils/email');
const customMiddleware = require('../middleware/customMiddleware');

const createToken = function(payload){
    return jwt.sign({id: payload},process.env.JWT_SECRET,{
        expiresIn: '2h'
    });
}


// function to sign in the user
module.exports.signin = catchAsync(async function (req, res, next) {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email: email
    }).select('+password');
    if (user && await user.correctPassword(password, user.password)) {
        req.session.user = user;
        req.session.authorized = true;
        // const token = createToken(user.id);
        // console.log("***TOKEN-",token);
        req.flash('success',"Sign In successfull!");
        return res.redirect('/');
    }
    req.flash('error',"Wrong Username or Password!");
    // return next(new AppError(404,'User doesnt Exists. Wrong Username or password!'));
    return res.redirect('back');
})


// function to sign up a user and create a new account
module.exports.signup = catchAsync(async function (req, res, next) {
    const { firstName, surname, email, password, day, month, year, gender } = req.body;
    const dob = new Date(year, month, day);
    let user = new userModel({
        name: firstName + " " + surname,
        password: password,
        email: email,
        dateOfBirth: dob,
        gender: gender
    });

    user = await user.save();
    // console.log(user.id);
    // const token = createToken(user.id);
    // console.log(token);
    // res.cookie("token", token);
    req.flash('success',"Sign Up successfull! Please Log in to continue.");
    return res.redirect('/authentication/sign-in/page');
})

module.exports.checkIfAlreadyAuthenticated = function(req,res,next){
    if((req.session && req.session.authorized===true)){
        return res.redirect('/');
    }
    return next();  
}



module.exports.signinPage = function(req,res){
    return res.render('signin',{
        title: "Sign in Page"
    })
}

module.exports.signupPage = function(req,res){
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
    return res.render('signup',{
        title: "Sign up Page",
        months: months
    })
}

module.exports.homePage = function(req,res){
    return res.render('home',{
        title: "Home Page"
    });
}

module.exports.logout = function(req,res){
    req.flash('success',"Logged out successfully!");    
    req.session.destroy();
    res.clearCookie('socialA');
    return res.redirect('/authentication/sign-in/page');
}

module.exports.profile = catchAsync(async function(req,res,next){
    // if(req.token){
    //     const user = await userModel.findById(req.tokenUserId);
        return res.status(200).json({
            status: 'Success',
            user: req.jwtuser,
            message: "Profile Page"
        });
    // }
    // next(new AppError(404,'cannot Find the user'));
})

module.exports.forgotPassword = catchAsync(async (req,res,next)=>{
    // check if user exists against that email
    const user = await userModel.findOne({email: req.body.email});
    if(!user){
        // return next(new AppError(401, "Email doesnot exists!"));
        req.flash('error',"Email doesnot exists!");
    }else{
        const reset = new resetModel({
            user: user._id
        });
        // reset Token
        const resetToken = reset.createTokenForPasswordReset();
        const url = `${req.protocol}://${req.get('host')}/resetPasswordPage/${resetToken}`;
        await reset.save();
        // Send the mail
        const sendPass = new createMail(user,url);
        await sendPass.sendPasswordResetMail();
        req.flash('success',"Mail shared successfully!");
    }
    return res.redirect('back');
    // return res.status(200).json({
    // //     status: "success",
    // //     message: "Email Shared"
    // // })
})

module.exports.forgotPasswordPage = (req,res,next)=>{
    return res.render('forgotPasswordPage',{
        title: 'Forgot Password'
    });
}

module.exports.resetPasswordPage = (req,res,next)=>{
    const token = req.params.token;
    return res.render('resetPassword',{
        title: 'Reset Password',
        token: token
    });
}

module.exports.resetPassword = catchAsync(async (req,res,next)=>{
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const reset = await resetModel.findOne({
        resetToken: token,
        expires: {$gt: Date.now()}
    }).populate('user');
    if(!reset){
        // return next(new AppError(400,"Invalid Reset token !"));
        req.flash('error',"Invalid Reset token!");
        return res.redirect('/authentication/sign-in/page')
    }
    const user = reset.user;
    const {password, confirmPassword} = req.body;

    if(!(password === confirmPassword)){
        // return next(new AppError(401,"Password and confirm Password are not equal"));
        req.flash('error',"Password and confirm Password are not equal!");
        return res.redirect('back');
    }
    user.password = password;
    await user.save();
    req.flash('success',"Password reset Successfully!");
    return res.redirect('/authentication/sign-in/page');
})
