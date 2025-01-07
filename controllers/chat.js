const Chat = require('../models/chat');
const { io } = require('../index'); // Or wherever your server setup is
const nodemailer = require('nodemailer');
// Start a new chat session
exports.startChat = async (req, res) => {
  const chat = new Chat();
  await chat.save();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Gmail SMTP server
    port: 587, // Port for TLS/STARTTLS
    secure: false, // Use false for 587, true for 465
    auth: {
      user: process.env.EMAIL_SENDER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
  });

  // Send OTP email
  const mailOptions = {
    from: '"The First Web Team" <support@thefirstweb.com>',
    to: "abhikriitd@gmail.com",
    subject: "User has joined a chat room please go",
    text: `Go to https://www.thefirstweb.com/adminChat`,
  };
  await transporter.sendMail(mailOptions);
  console.log("hi")
  res.json({ chatId: chat._id });
};

// Send a message in the chat
exports.sendMessage = async (req, res) => {
  const { chatId, sender, message } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const newMessage = { sender, message };
    chat.messages.push(newMessage);
    await chat.save();

    // Emit the new message to all clients in the chat room
    io.to(chatId).emit("newMessage", newMessage);

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get all messages for a chat
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};
