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
    discount: {
        type: Number,
        default: 0,
    }
});

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
