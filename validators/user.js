const { body } = require('express-validator');

exports.validateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address'),

    body('phone_code')
        .notEmpty()
        .withMessage('Phone code is required')
        .isNumeric()
        .withMessage('Phone code must be numeric'),

    body('phone_number')
        .notEmpty()
        .withMessage('Phone number is required')
        .isNumeric()
        .withMessage('Phone number must be numeric')
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 digits'),

    body('address')
        .optional()
        .isLength({ min: 0 })
        .withMessage('Address should be at least 5 characters long'),

    body('location')
        .optional()
        .isLength({ min: 0 })
        .withMessage('Location should be at least 5 characters long'),
];
