const mongoose = require('mongoose');

// Define the UserOTP schema
const UserOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  // Ensure each email has a unique OTP
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300  // OTP expires after 5 minutes (300 seconds)
    }
});

// Create the UserOTP model
const UserOTP = mongoose.model('UserOTP', UserOTPSchema);

module.exports = UserOTP;
