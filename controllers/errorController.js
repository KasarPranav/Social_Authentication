const AppError = require('../utils/errorClass');

require('dotenv').config();

const handleJWTInvalidTokenError = () => {
    return new AppError(400, 'Invalid Token, Please login again !' )
}

const handleJWTTokenExpiredError = () =>{
    return new AppError(400, 'Token Expired, Please login again !' )
}

const errorInDev = (err,res)=>{
    return res.status(err.statusCode).json({
        stack: err.stack,
        error: err,
        status: err.status,
        message: err.message
    });
}

const errorInProd = (err,res)=>{
    if(err.isOperational){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }else{
        console.error("*****Non operational ERROR: ",err);
        return res.status(500).json({
            status: 'Internal Error',
            message: "Something went Wrong!"
        });
    }
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    if(process.env.ENVIRONMENT === 'Development'){
        errorInDev(err,res);
    }else if(process.env.ENVIRONMENT === 'Production'){
        let error = { ...err };
        if(error.name === 'JsonWebTokenError') error = handleJWTInvalidTokenError();
        if(error.name === 'TokenExpiredError') error = handleJWTTokenExpiredError();
        errorInProd(error,res);
    }
}