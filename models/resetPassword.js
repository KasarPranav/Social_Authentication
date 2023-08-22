const mongoose = require('mongoose');
const crypto = require('crypto');
const resetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    },
    expires: {
        type: Date
    },
    resetToken: {
        type: String,
        required: true
    }

}, {
    timestamps:true
})

resetSchema.methods.createTokenForPasswordReset = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log('**',this.resetToken);
    this.expires = Date.now() + 1000*60*10; // now + 10 mins
    return resetToken;
}

module.exports = new mongoose.model('ResetPassword',resetSchema);