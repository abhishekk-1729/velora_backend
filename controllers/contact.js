const { validationResult } = require('express-validator');
const Contact = require('../models/contact'); // Adjust the path as necessary
const { validateContact } = require('../validators/contact');

exports.addContact = async (req, res) => {
    console.log(req);
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message, phone_code, phone_number, address } = req.body;

    try {
        const newContact = new Contact({ name, email, message, phone_code, phone_number, address });
        await newContact.save();
        res.status(201).json({ success: true, message: 'Contact form submitted successfully', contact: newContact });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get all Contacts
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json({ success: true, contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Contact by ID
exports.getContactById = async (req, res) => {
    const { id } = req.params;

    try {
        const contact = await Contact.findById(id);
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.status(200).json({ success: true, contact });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete a Contact by ID
exports.deleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
