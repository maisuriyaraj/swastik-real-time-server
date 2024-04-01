// models/userChat.js
const mongoose = require('mongoose');

const userChatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  msgTime:String,
  is_payment:{type:Boolean,default:false},
  paid_amount:{type:Number}
  // Add any other fields you need for the chat message
});

const UserChat = mongoose.model('channel_messages', userChatSchema);

module.exports = UserChat;
