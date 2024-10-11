const express = require('express');
const { createOrder, getAllOrders, getOrderById, deleteOrder,getAllOrdersByUserId } = require('../controllers/order');
const router = express.Router();

router.post('/createOrder', createOrder);
router.get('/getAllOrders', getAllOrders);
router.get('/getOrder/:id', getOrderById);
router.get('/getAllOrders/user/:userId', getAllOrdersByUserId);
router.delete('/deleteOrder/:id', deleteOrder);

module.exports = router;
