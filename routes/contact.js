const express = require('express');
const contactController = require('../controllers/contact');
const router = express.Router();
const { validateContact } = require('../validators/contact');
const validateRequest = require('../middleware/validateRequest');
// Routes for Contact operations
router.post('/addContact', validateContact, validateRequest, contactController.addContact);             // Add a new contact form submission
module.exports = router;

// router.get('/getAllContacts', contactController.getAllContacts);      // Get all contact submissions
// router.get('/getContactById/:id', contactController.getContactById);  // Get a contact by its ID
// router.delete('/deleteContact/:id', contactController.deleteContact); // Delete a contact by ID

