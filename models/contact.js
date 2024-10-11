const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_code: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: { type: String, required: false },
    message: { type: String, required: false }
});

const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;
