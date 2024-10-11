const Order = require('../models/order');

// 1. Create an order
const createOrder = async (req, res) => {
    const { user_id, service_id, discount } = req.body;
    try {
        const order = new Order({ user_id, service_id, discount });
        await order.save();
        res.status(201).json({ success: true, message: 'Order created successfully', order });
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
    const { userId } = req.params;
    try {
        const orders = await Order.find({ user_id: userId }).populate('service_id');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    deleteOrder,
    getAllOrdersByUserId
};
