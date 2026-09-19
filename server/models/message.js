const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId, ref : 'chats',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, ref : 'users',
    },   
    text: {
        type: String, 
        required: true,
    },
    read:{
        type: Boolean,
        default: false,
    }

},{timestamps: true}); // createdAt aur updatedAt fields automatically add karne ke liye

module.exports = mongoose.model('messages', messageSchema);