const express = require('express');
const { createOrder, getAllOrders, getOrderById, deleteOrder,getAllOrdersByUserId } = require('../controllers/order');
const router = express.Router();
const authMiddleware = require("../middleware/auth")

router.post('/createOrder', authMiddleware, createOrder);
// router.get('/getAllOrders', getAllOrders);
// router.get('/getOrder/:id', getOrderById);

router.get('/getAllOrders/user',authMiddleware, getAllOrdersByUserId);
// router.delete('/deleteOrder/:id', deleteOrder);

module.exports = router;
