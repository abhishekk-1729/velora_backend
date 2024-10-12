const mongoose = require('mongoose');

const CouponCodeSchema = new mongoose.Schema({
    // user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coupon_code: { type: String, required: true },
    discount_percent: { type: Number, required: true },
    cashback_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cashback', required: false },
    issued_date: { type: Date, default: Date.now },
    expiry_date: { type: Date, required: true }
});

const CouponCode = mongoose.model('CouponCode', CouponCodeSchema);
module.exports = CouponCode;
