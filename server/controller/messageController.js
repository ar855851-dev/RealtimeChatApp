const route = require('express').Router();
const authMiddleware = require('./../middlewares/authMiddleware');
const chat = require('./../models/chat');
const message = require('./../models/message');

route.post('/new-message', authMiddleware, async (req, res) => {
    try {
        // for storing the message in message collection
        const newMessage = new message({
            chatId: req.body.chatId,
            sender: req.body.sender,
            text: req.body.text
        });   
        const savedMessage = await newMessage.save();                        //message ko meassage collection me save krne ke liye

        // for updating the last message in chat collection
         const currentChat = await chat.findByIdAndUpdate({
             _id: req.body.chatId 
            }, { lastMessage: savedMessage._id},
            {
                new: true
            }
        );  

                      //chat collection me chat id se chat find krne ke liye aur last message ko update krne ke liye    
            
             res.status(201).send({
                message: "Message sent successfully",
                success: true,
                data: savedMessage,
            });
            } catch (error) {
              res.status(400).send({
              message: error.message,
              success: false
        });
    }
})
route.get('/get-all-messages/:chatId', authMiddleware, async (req, res) => {
    try {
        const allMessages = await message.find({chatId: req.params.chatId}).sort({createdAt :1}); // chatId se messages find krne ke liye aur unko createdAt ke hisab se sort krne ke liye
        res.status(200).send({
            message: "Messages fetched successfully",
            success: true,
            data: allMessages

        });
    } catch (error) {
        res.status(400).send({
            message: error.message,
            success: false
        });
    }
})

module.exports = route;