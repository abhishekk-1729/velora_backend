// validators/cashbackValidator.js

const { body } = require('express-validator');

const validateCashback = [
    body('user_id')
        .exists().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid User ID format'),
        
    body('cashback_percent')
        .exists().withMessage('Cashback percent is required')
        .isNumeric().withMessage('Cashback percent must be a number')
        .isFloat({ min: 0, max: 100 }).withMessage('Cashback percent must be between 0 and 100'),
];

module.exports = {
    validateCashback,
};
