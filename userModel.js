// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
  socketId: { type: String },
  is_active: { type: Boolean, default: false }
});

const User = mongoose.model('chat_channels', userSchema);

module.exports = User;
