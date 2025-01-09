const Chat = require('../models/chat');
const { io } = require('../index'); // Or wherever your server setup is
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from Twilio
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from Twilio
const smsNumber = process.env.TWILIO_SMS_NUMBER; // Your Twilio WhatsApp number

// Start a new chat session
exports.startChat = async (req, res) => {
  const chat = new Chat();
  await chat.save();
  try {
    // Initialize the Twilio client
    const client = twilio(accountSid, authToken);

    // Sending SMS using Twilio API
    const result = await client.messages.create({
        from: smsNumber,      // Your Twilio phone number (e.g., +1234567890)
        to: "+918755273773",            // Recipient's phone number
        body: "Joined the chat. Go to www.thefirstweb.com/adminChat",        // The message body (text) you want to send
    });
} catch (error) {
    // Handle errors and respond with failure message
    console.log(error)
}


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
