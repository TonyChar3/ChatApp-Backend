import mongoose from 'mongoose';

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
    }
},
{
    timestamps: true,
}
);

export default mongoose.model("User", userSchema);