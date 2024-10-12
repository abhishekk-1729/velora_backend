const express = require('express');
const cashbackController = require('../controllers/cashback');
const router = express.Router();
const { validateCashback } = require('../validators/cashback')
const validateRequest = require('../middleware/validateRequest');
;
// Routes for Coupon operations
router.post('/addCashback', validateCashback , validateRequest, cashbackController.addCashback);             // Add a new coupon

module.exports = router;
