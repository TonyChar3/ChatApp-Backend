import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';
import Chatroom from '../models/chatroomModels.js';


//@desc Get all the contacts
//@route GET /contacts/contact
// access private
const getAllContacts = asyncHandler(async(req,res) => {

    try{
        // fetch the user
        const user = await User.findById(req.user.id)

        // if empty send a empty contact list message back
        if(user.contact_list.length === 0){
            // send a message to notify the user the array is empty
            res.send({ message: "Add contacts :)"})
        } else {
            // else send the contacts objects
            user.contact_list.forEach(element => {
                res.send(element)
            });
        }
    } catch(err){
        next(err)
    }
});

//@desc Create a new contact
//@route POST /contacts/contact
// access private
const createContact = asyncHandler(async(req,res) => {

    try {
        // deconstruct the contact email & name
        const { contct_email, contct_name} = req.body

        // check if info was sent
        if ( !contct_email || !contct_name ){
            res.status(400).json({ message: "Please provide a username & a email"});
            throw new Error("Please enter the credentials")
        }

        // fetch user
        const user = await User.findById(req.user.id);

        if(!user){
            res.status(404).json({ message: 'We cannot find your data'});
            throw new Error("We cannot find your data")
        }

        // fetch the contact the user wants to add
        const contact = await User.findOne({ email:contct_email });

        // if it is not found
        if(!contact){
            res.status(404).json({ message: "User does not exist"});
            throw new Error("User does not exist")
        } else {
            // check if it is not already added
            if(user.contact_list.length > 0){
                user.contact_list.forEach(element => {
                    // error if true
                    if(element.contact_id === contact.id){
                        res.status(403).json({ message: "User already added"});
                        throw new Error("User already added")
                    }
                });
            }

            // create a new contact object
            const newContact = {
                chatroom_id: 0,
                confirmed: "",
                contact_id: contact.id
            }

            // create a new invite object
            const newInvite = {
                sender_id: user.id,
                sent_from: user.username,
                sender_email: user.email
            }

            // add the new contact
            const addContact = await user.updateOne({
                $push: {
                    contact_list: newContact
                }
            })

            // add the new invite
            await contact.updateOne({
                $push: {
                    invitations: newInvite
                }
            })

            if(addContact){
                res.status(201).json({ message: "Invite sent"});
            }
        }
    } catch(err){
        console.log(err)
    }

});

//@desc Delete a contact
//@route DELETE /contacts/contact
// access private
const deleteContact = asyncHandler(async(req, res) => {

    try{
        // deconstruct the request
        const { contct_id, contct_status } = req.body;

        // Get the access to the current user
        const user = await User.findById(req.user.id)

        // delete the invite
        // find the index of the invite
        const indexInvite = await user.contact_list.findIndex(contact => contact.contact_id.toString() === contct_id);

        if(indexInvite !== -1){
            // if confirmed === "true"
            if(contct_status === "true"){

                // find the contact in the user DB
                const contct_user = await User.findById(contct_id)

                // Update the sender contact list by adding the chatroom_id and setting confirmed to true
                const contact_user_Index = contct_user.contact_list.findIndex(contact => contact.contact_id.toString() === user.id.toString());

                // if nothing was found
                if (contact_user_Index === -1) {
                    res.status(404).json({ message: "Error...user non-existant" });
                    throw new Error("Error...user non-existant");
                }

                // Set confirmed to 'true'
                contct_user.contact_list[contact_user_Index].confirmed = false;

                // save the update
                await contct_user.save();
                
                // find the chatroom
                const chatroom = await Chatroom.findOne({ room_id: contct_user.contact_list[contact_user_Index].chatroom_id })

                // verify if it is found or not
                if(!chatroom){
                    res.status(404).json({ message: "Chat room not found" });
                    throw new Error("Room not found");
                }

                // delete the room
                const deleteRoom = await chatroom.deleteOne({ room_id: contct_user.contact_list[contact_user_Index].chatroom_id })

                // verify if the room was deleted or not
                if(!deleteRoom){
                    res.status(500).json({ message: "Unable to delete the chatroom" });
                    throw new Error("Unable to delete the chatroom");
                }

                // find the index of the contact in the contact list
                const indexContact = await user.contact_list.findIndex(contact => contact.contact_id.toString() === contct_id.toString());
                
                // if the contact was found inside the list
                if(indexContact !== -1){
                    // delete the invite from the invitations list
                    user.contact_list.splice(indexContact, 1);

                    // save the updates
                    await user.save();

                    // send back a success response via JSON
                    res.status(200).json({ message: "Contact deleted"})
                }

            } else if (contct_status === "false"){
                // find the index of the contact in the contact list
                const indexContact = await user.contact_list.findIndex(contact => contact.contact_id.toString() === contct_id.toString());
                
                // if the contact was found inside the list
                if(indexContact !== -1){
                    // delete the invite from the invitations list
                    user.contact_list.splice(indexContact, 1);
                
                    // save the updates
                    await user.save();
                
                    // send back a success response via JSON
                    res.status(200).json({ message: "Contact removed"})
                }
            }
        }
    } catch(err){
        next(err)
    }
});

export {getAllContacts, createContact, deleteContact};