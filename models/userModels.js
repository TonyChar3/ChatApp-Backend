import mongoose from 'mongoose';

/**
 * User mongoose Schema
 */

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add a username"]
    },
    email: {
        type:String,
        required: [true, "Please provide an email address"],
        unique: [true, "Email address already in use"]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
    },
    invitations: [{
        sender_id: {
            type: String
        },
        sent_from: {
            type: String
        },
        sender_email: {
            type: String
        }
    }],
    contact_list: [{
        chatroom_id: {
            type: Number
        },
        confirmed: {
            type: String
        },
        contact_id: {
            type: String
        }
    }]
},
{
    timestamps: true,
}
);

export default mongoose.model("User", userSchema);