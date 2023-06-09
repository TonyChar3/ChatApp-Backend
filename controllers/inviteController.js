import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';
import Chatroom from '../models/chatroomModels.js';

//@desc See all of the received invites
//@route GET /invitations/invites
// access private
const allInvites = asyncHandler(async(req,res,next) => {
    try{
        // fetch the user
        const user = await User.findById(req.user.id)

        // if empty send a empty invitation list message back
        if(user.invitations.length === 0){
            // send a message to notify the user the array is empty
            res.send({ message: "No invites :)"})
        } else {
            // else send the contacts objects
            user.invitations.forEach(element => {
                res.send(element)
            });
        }
    } catch(err){
        next(err)
    }
});

//@desc Accept the invitation
//@route DELETE /invitations/accept
// access private
const acceptInvite = asyncHandler( async (req,res,next) => {

    try{
        // deconstruct the sender email and username
        const { sender_id } = req.body;

        // Fetch the sender info from the db
        const sender = await User.findById(sender_id)
            // make sure it is found
            if(!sender){
                // respond back with error message
                res.status(404).json({ message: "Sender not found" });
                // throw a new error in the console
                throw new Error('Sender not found...')
            }

        // Fetch the current user info from the db
        const user = await User.findById(req.user.id)
            // make sure it is found
            if(!user){
                // respond back with error message
                res.status(400).json({ message: 'You need to authenticate'})
            }


        // flag to check if the room id is valid or not
        const room_flag = true
        
        // the random chat room id
        let random_id;

        // make sure it is not a duplicate
        do {
            // Generate a chatroom_id number
            random_id = Math.floor(Math.random()*1000);

            // make sure it is unique (By looking in the chatroom DB)
            const room_duplicate = await Chatroom.findOne({ room_id: random_id })

            // check if it is a duplicate
            if(room_duplicate){

                // set the flag to true
                room_flag = true;

            } else if(room_duplicate === null){
                break;
            }
        } while(room_flag === true)
        
        // Update the sender contact list by adding the chatroom_id and setting confirmed to true
        const contactIndex = sender.contact_list.findIndex(contact => contact.contact_id.toString() === user.id.toString());

        // if nothing was found
        if (contactIndex === -1) {
            // respond back with error message
            res.status(404).json({ message: "Error...user non-existant" });
            // throw a new Error inside the console
            throw new Error("Error...user non-existant");
        }

        // Set the chatroom ID 
        sender.contact_list[contactIndex].chatroom_id = random_id;

        // Set confirmed to 'true'
        sender.contact_list[contactIndex].confirmed = true;

        // Save the updated values
        await sender.save();

        // Add the sender as contact
        const newContact = {
            chatroom_id: random_id,
            confirmed: "true",
            contact_id: sender.id
        }

        // add the new contact
        const addContact = await user.updateOne({
            $push: {
                contact_list: newContact
            }
        })

        // Create the chatroom with both user in it
        const room = await Chatroom.create({
            room_id: random_id,
            confirmed_user:[
                {
                    name: sender.username,
                    chat_user_id: sender.id
                },
                {
                    name: user.username,
                    chat_user_id: user.id
                }
            ]
        })
        
        // find the index of the invite
        const indexInvite = await user.invitations.findIndex(contact => contact.sender_id.toString() === sender.id.toString());

        // if the index is found
        if(indexInvite !== -1){

            // delete the invite from the invitations list
            user.invitations.splice(indexInvite, 1);

            // save the updates
            await user.save();

        } else if(indexInvite === -1){

            // respond back with error message
            res.status(404).json({ message: "index not found"})
        }
    
        // Send back a success message
        if(room && addContact){
            // respond back with success message
            res.status(201).json({ message: "Invite accepted, chatroom created" });
        }
    } catch(err){
        next(err)
    }
});

//@desc Decline the invitation
//@route DELETE /invitations/decline
// access private
const declineInvite = asyncHandler( async (req,res,next) => {

    try{
        // deconstruct the sender email and username
        const { sender_id } = req.body;

        // Fetch the sender info from the db
        const sender = await User.findById(sender_id)

        // if nothing is found
        if(!sender){
            // respond back with error message
            res.status(404).json({ message: "Sender not found" });
            // throw a new error inside the console
            throw new Error('Sender not found...')
        }

        // Fetch the current user info from the db
        const user = await User.findById(req.user.id)

        // make sure it is found
        if(!user){
            // respond back with error message
            res.status(400).json({ message: 'You need to authenticate'})
        }

        // Update the sender contact list by setting confirmed to false
        const contactIndex = sender.contact_list.findIndex(contact => contact.contact_id.toString() === user.id.toString());

        // if nothing was found
        if (contactIndex === -1) {
            // respond back with error message
            res.status(404).json({ message: "Error...user non-existant" });
            // throw a new error inside the console
            throw new Error("Error...user non-existant");
        }

        // Set confirmed to 'false'
        sender.contact_list[contactIndex].confirmed = false;

        // Save the updated values
        await sender.save();

        // find the index of the invite
        const indexInvite = await user.invitations.findIndex(contact => contact.sender_id.toString() === sender.id.toString());

        // if an index was found
        if(indexInvite !== -1){

            // delete the invite from the invitations list
            user.invitations.splice(indexInvite, 1);

            // save the updates
            await user.save();
        }

        // send a success message back
        res.status(200).json({ message: `Invite from ${sender.username} declined` })

    } catch(err){
        next(err)
    }
});

export { acceptInvite, declineInvite, allInvites };