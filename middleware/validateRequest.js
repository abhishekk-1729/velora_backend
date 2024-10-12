const { validationResult } = require('express-validator');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next(); // If no errors, proceed to the next middleware or route handler
};

module.exports = validateRequest;
