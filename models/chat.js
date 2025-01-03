const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin'], default: 'user' },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  messages: [messageSchema],
  active: { type: Boolean, default: true }, // Active chat status
});

module.exports = mongoose.model('Chat', chatSchema);
