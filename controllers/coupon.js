const Coupon = require('../models/coupon');

// 1. Add a new Coupon
exports.addCoupon = async (req, res) => {
    const { code, discount, expiryDate } = req.body;

    try {
        const newCoupon = new Coupon({ code, discount, expiryDate });
        await newCoupon.save();
        res.status(201).json({ success: true, message: 'Coupon added successfully', coupon: newCoupon });
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
