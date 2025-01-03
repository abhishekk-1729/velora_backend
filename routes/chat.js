const express = require('express');
const router = express.Router();

// Import route handlers (controllers)
const chatController = require('../controllers/chat');
const adminController = require('../controllers/chatAdmin');

// Chat routes
router.post('/start', chatController.startChat);
router.post('/sendMessage', chatController.sendMessage);
router.get('/getMessages/:chatId', chatController.getMessages);

// Admin routes
router.get('/admin/activeChats', adminController.getActiveChats);
router.post('/admin/sendMessage', adminController.sendAdminMessage);

module.exports = router;
