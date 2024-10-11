const express = require('express');
const couponController = require('../controllers/coupon');
const router = express.Router();

// Routes for Coupon operations
router.post('/addCoupon', couponController.addCoupon);             // Add a new coupon
router.get('/getAllCoupons', couponController.getAllCoupons);      // Get all coupons
router.get('/getCouponById/:id', couponController.getCouponById);  // Get a coupon by its ID
router.put('/updateCoupon/:id', couponController.updateCoupon);    // Update a coupon by ID
router.delete('/deleteCoupon/:id', couponController.deleteCoupon); // Delete a coupon by ID

module.exports = router;
