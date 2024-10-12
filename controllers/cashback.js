const Cashback = require('../models/cashback');

// 1. Add a new Coupon
exports.addCashback = async (req, res) => {
    const {user_id, cashback_percent } = req.body;
    
    try {
        const newCashback = new Cashback({user_id, cashback_percent  });
        await newCashback.save();
        res.status(201).json({ success: true, message: 'Cashback added successfully', cashback: newCashback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
