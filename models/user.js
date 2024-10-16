const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_code: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: { type: String, required: true },
    location: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;