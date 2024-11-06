const mongoose = require('mongoose');

const TryMailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
});

const TryMail = mongoose.model('TryMail', TryMailSchema);
module.exports = TryMail;
