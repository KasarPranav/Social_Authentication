const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: "Invalid Email",
            isAsync: false
        },
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male","Female","Others"]
    },
    passwordChangedAt: Date
},{
    timestamps: true
});

userSchema.pre('save',{ document: true, query: false },async function(next){
    if(!(this.isModified('password'))) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre('save',{ document: true, query: false }, async function(next){
    if(!(this.isModified('password') || this.isNew)) return next();
    this.passwordChangedAt = Date.now()-1000;
    next();
})

userSchema.methods.correctPassword = async function(passedPassword, actualPassword){
    return await bcrypt.compare(passedPassword,actualPassword);
}

userSchema.methods.checkPasswordChanged = function(jwtIssuedAt){
    if(this.passwordChangedAt){
        const jwtDate = new Date(jwtIssuedAt*1000);
        return jwtDate < this.passwordChangedAt
    }
    return false;
}

module.exports = new mongoose.model('users',userSchema);