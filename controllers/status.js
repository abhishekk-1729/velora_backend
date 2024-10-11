const Status = require('../models/status');

// 1. Create a status for an order
const createStatus = async (req, res) => {
    const { order_id, completed_steps } = req.body;
    try {
        const status = new Status({ order_id, completed_steps });
        await status.save();
        res.status(201).json({ success: true, message: 'Status created successfully', status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get all statuses
const getAllStatuses = async (req, res) => {
    try {
        const statuses = await Status.find().populate('order_id');
        res.status(200).json({ success: true, statuses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get status by order ID
const getStatusByOrderId = async (req, res) => {
    const { order_id } = req.params;
    try {
        const statuses = await Status.find({ order_id });
        res.status(200).json({ success: true, statuses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Delete a status
const deleteStatus = async (req, res) => {
    const { id } = req.params;
    try {
        await Status.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Status deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createStatus,
    getAllStatuses,
    getStatusByOrderId,
    deleteStatus,
};
