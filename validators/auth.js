const { body } = require('express-validator');

const validateEmailAndLocation = [
    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
        
    body('location')
        .exists().withMessage('Location is required')
        .isString().withMessage('Location must be a string'),
];

const validateOtp = [
    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('otp')
        .exists().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

module.exports = {
    validateEmailAndLocation,
    validateOtp,
};
