const mongoose = require('mongoose');

// Define the Order schema
const OrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    couponCodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CouponCode',
        required: false,
    },
    discount: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: null,
    },
    totalAmountOrder: {
        type: Number,
        default: null,
    },
    currencyChange: {
        type: Number,
        default: null,
    },
});

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
