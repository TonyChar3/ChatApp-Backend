import asyncHandler from 'express-async-handler';
import Chatroom from '../models/chatroomModels.js';

//@desc Add a new Message to the chat
//@route POST /chat/newMsg
// access private
const newChatMsg = asyncHandler( async(req,res,next) => {
    res.json({ message: "A new message was written" })
});

//@desc Delete a Message from the chat
//@route DELETE /chat/newMsg
// access private
const deleteChatMsg = asyncHandler( async(req,res,next) => {
    res.json({ message: "The message was deleted" })
});

//@desc Fetch every Messages from the array
//@route GET /chat/chatMsg
// access private
const allChatMsg = asyncHandler( async(req,res,next) => {
    res.json({ message: "Here's all the messages of the chatroom" })
});


export { newChatMsg, deleteChatMsg, allChatMsg };