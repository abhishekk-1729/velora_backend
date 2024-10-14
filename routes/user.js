const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const authMiddleware = require("../middleware/auth")

// Routes
router.post('/addUser', userController.addUser);
router.get('/getUserByEmail/:email', userController.getUserByEmail);
router.get('/getUserById', authMiddleware, userController.getUserById);
router.post('/addUserTryLogin', userController.addUserTryLogin);
router.post('/addUserTrySignup', userController.addUserTrySignup);
router.post('/sendOtp', userController.sendOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.get('/getAllOrdersByEmail/:email', userController.getAllOrdersByEmail);
router.post('/getOtpCreatedAt', userController.getOtpCreatedAt);

module.exports = router;
