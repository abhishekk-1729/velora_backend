const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 mins
});

const Otp = mongoose.model('Otp', OtpSchema);
module.exports = Otp;
