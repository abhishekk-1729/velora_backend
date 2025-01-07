// General Imports 
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
require('express-async-errors');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require("./models/chat")
// Routers Import
const allroutes = require('./routes');

// Error Handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend's URL in production
  },
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// Use routes
app.use(allroutes);

// Error handler middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Socket.IO: Handle real-time messaging
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('sendMessage', async ({ chatId, sender, message }) => {
    try {
      // Save the message to the database
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      // Add the new message to the chat's messages array
      const createdAt = new Date();
      chat.messages.push({
        sender,
        message,
        createdAt: createdAt
      });

      // Save the updated chat to the database
      await chat.save();

      // Emit the new message to all clients in the chat room
      io.to(chatId).emit('newMessage', { sender, message, createdAt });

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

// Fetch active chats when requested
socket.on('getActiveChats', async () => {
  try {
    const chats = await Chat.find({ active: true }, '_id'); // Only fetch active chats
    socket.emit('activeChats', chats.map(chat => chat._id)); // Emit active chat rooms to the admin
  } catch (error) {
    console.error('Error fetching active chats:', error);
  }
});

socket.on('closeChat', async (chatId) => {
  try {
    // Mark the chat as inactive
    await Chat.findByIdAndUpdate(chatId, { active: false });
    console.log(`Chat ${chatId} has been closed.`);
  } catch (error) {
    console.error('Error closing chat:', error);
  }
});

  // Fetch chat history when an admin selects a chat room
  socket.on('getChatHistory', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId); // Find the selected chat by its ID
      console.log(chat)
      if (!chat) {
        socket.emit('chatHistory', []); // If chat not found, send empty history
      } else {
        socket.emit('chatHistory', chat.messages); // Send chat history (messages)
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('chatHistory', []); // If error occurs, return empty history
    }
  });

  // Send new message to the selected chat room
  socket.on('adminSendMessage', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', 'Chat not found');
      }

      // Create the new message
      const createdAt = new Date();
      const newMessage = {
        sender: 'admin',
        message,
        createdAt: createdAt
      };

      // Save the new message in the chat
      chat.messages.push(newMessage);
      await chat.save();

      // Emit the new message to all clients in the chat room
      io.to(chatId).emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Error sending message');
    }
  });

  // Handle when a user joins a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId); // Join the chat room
    console.log(`User joined chat room: ${chatId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Starting the server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Database');
    server.listen(process.env.PORT, () =>
      console.log(`Server is listening on port ${process.env.PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
