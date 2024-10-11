const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    service_name: { type: String, required: true },
    originalPrice: { type: Number, required: true }
});

const Service = mongoose.model('Service', ServiceSchema);
module.exports = Service;
