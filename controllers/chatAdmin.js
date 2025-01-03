const Chat = require('../models/chat');
const { io } = require('../index'); // Or wherever your server setup is

// Get all active chat rooms
exports.getActiveChats = async (req, res) => {
  try {
    const activeChats = await Chat.find(); // Get all chats from the database
    res.json(activeChats.map(chat => chat._id)); // Return chat IDs
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active chats' });
  }
};

// Send a message to a chat as an admin
exports.sendAdminMessage = (req, res) => {
  const { chatId, message } = req.body;

  try {
    // Emit to all clients in the chat room
    io.to(chatId).emit('newMessage', {
      sender: 'admin',
      message,
    });

    res.json({ sender: 'admin', message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send admin message' });
  }
};
