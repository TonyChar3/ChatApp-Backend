import asyncHandler from 'express-async-handler';
import Chatroom from '../models/chatroomModels.js';
import User from '../models/userModels.js';

//@desc Add a new Message to the chat
//@route POST /chat/newMsg
// access private
const newChatMsg = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the chatroom_id and the message wanting to be sent
        const { room_id, msg } = req.body;

        // Fetch the current logged in user in the DB
        const user = await User.findById(req.user.id)

        // Check if the current user is found
        if (!user){
            // respond back with an error message
            res.status(404).json({ message: "Unable to send the message"});
            // throw error in the console
            throw new Error("Unable to send the new message");
        }

        // Fetch the chatroom they're both in with the given chatroom_id
        const chatroom = await Chatroom.findOne({ room_id: room_id });

        // check if the chatroom was found
        if (!chatroom){
            // respond back with an error message
            res.status(404).json({ message: "This chat room is unavaible"})
            // throw error in the console
            throw new Error("Unable to find the chat room")
        }
        
        // Verify the message isn't empty ( if empty throw an error )
        if(!msg){
            // respond back with 404 status
            res.status(401)
            // and throw error in the console
            throw new Error("Message was empty")
        }

        // flag to check if the message id is valid
        const id_flag = false
    
        // the random chat room id
        let random_id;

        // make sure it is not a duplicate with a do...while loop
        do {
            // Generate a chatroom_id number
            random_id = Math.floor(Math.random()*1000);

            // make sure it is unique (By looking in the chatroom DB)
            const id_duplicate = chatroom.messages.findIndex(chat => chat._id.toString() === random_id.toString());

            // check if it is a duplicate or not
            if(id_duplicate !== -1){
                // set the flag to true
                id_flag = true;

            } else if(id_duplicate === -1){
                // leave the loop
                break;
            }
        } while(id_flag === true)
        
        // Create the message object
        const newMsg = {
            msg_user: user.username,
            text: msg,
            msg_user_id: user.id,
            _id: random_id
        }

        // Add it to the array of messages inside the chatroom
        const addChat = await chatroom.updateOne({
            $push: {
                messages: newMsg
            }
        });

        // if the chat was successfully sent
        if(addChat){
            // respond back with success message
            res.status(200).json({ message: "message sent" });
        } else {
            // if the chat was not sent
            res.status(500).json({ message: "Unable to send the message, try again later"});
            // throw error in the console
            throw new Error("Unable to send the message, try again later");
        }

    } catch(err){
        next(err)
    }
});

//@desc Delete a Message from the chat
//@route DELETE /chat/deleteMsg
// access private
const deleteChatMsg = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the message and room_id
        const { chat_msg_id, room_id } = req.body;

        // fetch the room
        const chatroom = await Chatroom.findOne({ room_id: room_id });

        // make sure it exist
        if (!chatroom) {
            res.status(404).json({ message: "This chat room is unavaible" });
            throw new Error("This chat room is unavaible");
        }

        // find the message in the array
        const messageIndex = chatroom.messages.findIndex(msg => msg._id.toString() === chat_msg_id.toString());

        // if nothing was found
        if (messageIndex === -1) {
            res.status(404).json({ message: "Error...message was already deleted" });
            throw new Error("Error...message was already deleted");
        }

        // delete the invite from the invitations list
        chatroom.messages.splice(messageIndex, 1);

        // save the updates
        const deleteRoom = await chatroom.save();

        // success message if the message was successfully deleted
        if(deleteRoom){
            res.status(200).json({ message: "Chat deleted"});
        }
       
    } catch(err){
        next(err)
    }
    // res.json({ message: "The message was deleted" })
});

//@desc Fetch every Messages from the array
//@route GET /chat/chatMsg
// access private
const allChatMsg = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the room id
        const { room_id } = req.body;

        // fetch the chatroom
        const chatroom = await Chatroom.findOne({ room_id: room_id })

        // verify if it was found
        if (!chatroom) {
            res.status(404).json({ message: "The room was not found in our database" });
            throw new Error("The room was not found in our database");
        } else{
            res.status(200).json(chatroom.messages)
        }
    } catch(err){
        next(err)
    }
});


export { newChatMsg, deleteChatMsg, allChatMsg };