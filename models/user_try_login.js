const mongoose = require('mongoose');

const UserTryLoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    datetime: { type: Date, default: Date.now },
    location: { type: String, required: true }
});

const UserTryLogin = mongoose.model('UserTryLogin', UserTryLoginSchema);
module.exports = UserTryLogin;
