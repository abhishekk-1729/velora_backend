const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const Status = require('../models/status');


// 1. Create an order
const createOrder = async (req, res) => {
    const { user_id, service_id, discount } = req.body;

    try {
        // Create a new order
        const order = new Order({ user_id, service_id, discount });
        await order.save();

        // Create a new status record with completed_steps set to 1
        const status = new Status({ order_id: order._id, completed_steps: 0 });
        await status.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
            status, // Optionally return the status if needed
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// 2. Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user_id').populate('service_id');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get order by ID
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('user_id').populate('service_id');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete an order
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await Order.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllOrdersByUserId = async (req, res) => {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is sent in the Authorization header as "Bearer token"

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        // Decode the token to get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Fetch all orders for the user
        const orders = await Order.find({ user_id: userId }).populate('service_id');

        // Map the orders to return the desired format
        const result = orders.map(order => {
            const originalPrice = order.service_id.originalPrice;
            const discountAmount = (originalPrice * order.discount) / 100; // Calculate discount amount
            const totalAmount = originalPrice - discountAmount; // Calcul            
            return {
                order_id: order._id,
                total_amount: totalAmount,
            };
        });

        res.status(200).json({
            success: true,
            orders: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    deleteOrder,
    getAllOrdersByUserId
};
