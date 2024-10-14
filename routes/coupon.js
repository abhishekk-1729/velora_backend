const express = require('express');
const couponController = require('../controllers/coupon');
const router = express.Router();
const { validateAddCoupon } = require('../validators/coupon')
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require("../middleware/auth")
// Routes for Coupon operations
router.post('/addCoupon', validateAddCoupon , validateRequest, couponController.addCoupon);             // Add a new coupon
// router.get('/getAllCoupons', couponController.getAllCoupons);      // Get all coupons
// router.get('/getCouponById/:id', couponController.getCouponById);  // Get a coupon by its ID
router.get('/getCouponsByUserId/:user_id', authMiddleware, couponController.getCouponsByUserId);  // Get a coupon by its ID
router.post('/verifyCoupon', authMiddleware, couponController.verifyCoupon);  // Get a coupon by its ID
// router.put('/updateCoupon/:id', couponController.updateCoupon);    // Update a coupon by ID
// router.delete('/deleteCoupon/:id', couponController.deleteCoupon); // Delete a coupon by ID

module.exports = router;
