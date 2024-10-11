const { body } = require('express-validator');

exports.validateContact = [
    body('name')
        // .optional() // Make optional if you don't want to require it
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),

    body('email')
        // .optional() // Make optional if you don't want to require it
        .isEmail()
        .withMessage('Please provide a valid email address'),

    body('message')
        .optional() // Make optional if you don't want to require it
        .trim()
        .isLength({ min: 0 })
        .withMessage('Message should be at least 10 characters long'),

    body('phone_code')
        // .optional() // Make optional if you don't want to require it
        .isNumeric()
        .withMessage('Phone code must be numeric'),

    body('phone_number')
        // .optional() // Make optional if you don't want to require it
        .isNumeric()
        .withMessage('Phone number must be numeric')
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 digits'),

    body('address')
        .optional()
        .isLength({ min: 0 })
        .withMessage('Address should be at least 5 characters long')
];
