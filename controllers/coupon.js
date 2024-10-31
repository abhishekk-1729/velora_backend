

const CouponCode = require('../models/coupon');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// 1. Add a new Coupon
exports.addCoupon = async (req, res) => {
    const {coupon_code, discount_percent, cashback_id, issued_date, expiry_date } = req.body;
    
    try {
        const newCoupon = new Coupon({coupon_code, discount_percent, cashback_id, issued_date, expiry_date  });
        await newCoupon.save();
        res.status(201).json({ success: true, message: 'Coupon added successfully', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Cashback = require('../models/cashback'); // Adjust path as necessary

// 6. Get Coupons by User ID
exports.getCouponsByUserId = async (req, res) => {
    const { user_id } = req.params; // Assuming user_id is passed as a URL parameter

    try {
        // Step 1: Find all cashback records for the user
        const cashbacks = await Cashback.find({ user_id });

        // If no cashbacks found, return a message
        if (!cashbacks.length) {
            return res.status(404).json({ success: false, message: 'No cashback records found for this user' });
        }

        // Step 2: Extract cashback IDs from the cashback records
        const cashbackIds = cashbacks.map(cashback => cashback._id);

        // Step 3: Find all coupon codes associated with the cashback IDs
        const coupons = await CouponCode.find({ cashback_id: { $in: cashbackIds } });

        // Return the coupons found
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyCoupon = async (req, res) => {
    const { coupon_code } = req.body; // Get coupon code from request body

    // Check for validation errors (optional if you have validation in place)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    try {
        // Step 1: Verify the token and get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId; // Assuming userId is stored in the token

        // Step 3: Find the coupon code
        console.log(coupon_code);
        const coupon = await CouponCode.findOne({ coupon_code });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon code not found' });
        }
        
        // Step 2: Check for cashback allocation for the user
        console.log(userId)
        const cashbackRecord = await Cashback.findOne({ _id: coupon.cashback_id });
        
        if (cashbackRecord && cashbackRecord.user_id == userId) {
            return res.status(400).json({ success: false, message: 'User has cashback allocated, coupon is invalid' });
        }


        // Step 4: Check if the coupon has expired
        const currentDate = new Date();
        if (coupon.expiry_date < currentDate) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        // If all checks pass, return the discount percent
        res.status(200).json({ success: true, discount_percent: coupon.discount_percent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// 2. Get all Coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Coupon by ID
exports.getCouponById = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await Coupon.findById(id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update a Coupon by ID
exports.updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { code, discount, expiryDate } = req.body;

    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, { code, discount, expiryDate }, { new: true });
        if (!updatedCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete a Coupon by ID
exports.deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
