const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// Routes
router.post('/addUser', userController.addUser);
router.get('/getUserByEmail/:email', userController.getUserByEmail);
router.post('/addUserTryLogin', userController.addUserTryLogin);
router.post('/addUserTrySignup', userController.addUserTrySignup);
router.post('/sendOtp', userController.sendOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.get('/getAllOrdersByEmail/:email', userController.getAllOrdersByEmail);

module.exports = router;
