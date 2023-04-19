import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';
import Chatroom from '../models/chatroomModels.js';


//@desc Get all the contacts
//@route GET /contacts/contact
// access private
const getAllContacts = asyncHandler(async(req,res) => {

    try{
        // fetch the user using the ID
        const user = await User.findById(req.user.id)

        // if empty send a empty contact list message back
        if(user.contact_list.length === 0){
            // send a message to notify the user the array is empty
            res.send({ message: "Add contacts :)"})
        } else {
            // else send the contacts objects
            user.contact_list.forEach(element => {
                // send back every contact object
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
            // respond back with error message
            res.status(400).json({ message: "Please provide a username & a email"});
            // throw error in the console
            throw new Error("Please enter the credentials")
        }

        // fetch the user in the DB using the ID
        const user = await User.findById(req.user.id);

        // If the user isn't found
        if(!user){
            // repsond back with error message
            res.status(404).json({ message: 'We cannot find your data'});
            // throw a new error in the console
            throw new Error("We cannot find your data")
        }

        // fetch the contact the user wants to add
        const contact = await User.findOne({ email:contct_email });

        // if it is not found
        if(!contact){
            // respond back with error message
            res.status(404).json({ message: "User does not exist"});
            // throw new error in the console
            throw new Error("User does not exist")
        } else {
            // check if it is not already added
            if(user.contact_list.length > 0){

                // loop through the user contact_list
                user.contact_list.forEach(element => {

                    // error if true
                    if(element.contact_id === contact.id){
                        // respond back with error message
                        res.status(403).json({ message: "User already added"});
                        // throw a new error in the console
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

            // add the new contact to the user contact_list array
            const addContact = await user.updateOne({
                $push: {
                    contact_list: newContact
                }
            })

            // add the new invite to the contact invitations array
            await contact.updateOne({
                $push: {
                    invitations: newInvite
                }
            })

            // if everything succeeds
            if(addContact){
                // respond back with success message
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
        // deconstruct the request body
        const { contct_id, contct_status } = req.body;

        // Get the access to the current user
        const user = await User.findById(req.user.id)

        // find the index of the contact in the array
        const indexContact = await user.contact_list.findIndex(contact => contact.contact_id.toString() === contct_id);

        // if the index was found
        if(indexContact !== -1){

            // if confirmed === "true"
            if(contct_status === "true"){

                // find the contact in the user DB
                const contct_user = await User.findById(contct_id)

                // Update the sender contact list by adding the chatroom_id and setting confirmed to true
                const contact_user_Index = contct_user.contact_list.findIndex(contact => contact.contact_id.toString() === user.id.toString());

                // if nothing was found
                if (contact_user_Index === -1) {
                    // respond back with error message
                    res.status(404).json({ message: "Error...user non-existant" });
                    // throw a new error in the console
                    throw new Error("Error...user non-existant");
                }

                // Set confirmed to 'false'
                contct_user.contact_list[contact_user_Index].confirmed = false;

                // save the update
                await contct_user.save();
                
                // find the chatroom in the DB
                const chatroom = await Chatroom.findOne({ room_id: contct_user.contact_list[contact_user_Index].chatroom_id })

                // verify if it is not found
                if(!chatroom){
                    // respond back with error message
                    res.status(404).json({ message: "Chat room not found" });
                    // throw new error in the console
                    throw new Error("Room not found");
                }

                // delete the chat room document from the collection in the DB
                const deleteRoom = await chatroom.deleteOne({ room_id: contct_user.contact_list[contact_user_Index].chatroom_id })

                // verify if the room was not deleted
                if(!deleteRoom){
                    // respond back with error message
                    res.status(500).json({ message: "Unable to delete the chatroom" });
                    // throw a new error in the console
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

            // if confirmed === "false"
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