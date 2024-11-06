const mongoose = require('mongoose');

const tryMessageSchema = new mongoose.Schema({
    phone: { type: String, required: true }
});

const tryMessage = mongoose.model('TryMessage', tryMessageSchema);
module.exports = tryMessage;
