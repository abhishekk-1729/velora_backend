const mongoose = require('mongoose');

const UserTrySignupSchema = new mongoose.Schema({
    email: { type: String, required: true },
    datetime: { type: Date, default: Date.now },
    location: { type: String, required: true }
});

const UserTrySignup = mongoose.model('UserTrySignup', UserTrySignupSchema);
module.exports = UserTrySignup;
