import mongoose from "mongoose";

const chatroomSchema = mongoose.Schema({
    room_id: {
        type: Number,
        required: [true,"This chatroom is unavaible"]
    },
    confirmed_user: [{
        name: {
            type: String,
            required:[true, "Username is missing"]
        },
        chat_user_id: {
            type: String,
            required:[true, "The User's ID is missing"]
        }
    }],
    messages: [{
        createdAt: {
            type: Date,
            default: Date.now
        },
        msg_id: {
            type: Number,
            required: true
        },
        msg_user: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        msg_user_id: {
            type: String,
            required: true
        }
    }]
})

export default mongoose.model("Chatroom", chatroomSchema);