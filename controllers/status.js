const Status = require('../models/status');
const Order  = require("../models/order")
const jwt = require("jsonwebtoken")
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

    // Step 1: Get the token from the request headers
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming 'Bearer <token>'
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    try {
        // Step 2: Verify the token and extract userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret
        const userId = decoded.userId; // Assuming the token contains a field 'userId'

        // Step 3: Check if the order belongs to the user
        const order = await Order.findOne({ _id: order_id, user_id: userId });
        const total_amount = order.totalAmountOrder;
        const paidAmount = total_amount*0.2;
        const remainingAmount = (total_amount - paidAmount) | 0;
        if (!order) {
            return res.status(403).json({ success: false, message: 'Access denied. This order does not belong to you.' });
        }

        // Step 4: Fetch status for the order and include completed_steps
        const status = await Status.findOne({ order_id });
        if (!status) {
            return res.status(404).json({ success: false, message: 'Status not found for this order.' });
        }

        const stepNames = [
            'advance_payment',
            "ui_discussion",
            "ui_started",
            "ui_completed",
            "client_review",
            "dev_started",
            "dev_completed",
            "initial_quality",
            "deployment_started",
            "deployment_completed",
            "precision_review",
            "final_review",
            "launch_readiness",
            "remaining_payment",
            "website_delivery"
        ];

        const formatDate = (date) => {
            if (!date) return "To be completed";
        
            const options = {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,                
                timeZone: 'UTC', // Set the time zone to UTC

            };
            return new Intl.DateTimeFormat('en-US', options).format(date);
        };
        

        const stepStatusArray = stepNames.map(step => {
            const date = status.dates.get(step);
            return  date ? formatDate(date) : "To be completed";
        });

        // Return statuses along with the number of completed steps
        res.status(200).json({
            success: true,
            statuses: stepStatusArray,
            completed_steps: status.completed_steps,
            remainingAmount: remainingAmount
        });
        
    } catch (error) {
        // Handle token verification errors or database errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
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
    deleteStatus
};
