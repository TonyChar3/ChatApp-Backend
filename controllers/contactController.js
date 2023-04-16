import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';


//@desc Get all the contacts
//@route GET /contacts/contact
// access private
const getAllContacts = asyncHandler(async(req,res) => {
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
    // deconstruct the request
    const { contct_id } = req.body;

    // Get the access to the current user
    const user = await User.findById(req.user.id)

    // delete the invite
    // find the index of the invite
    const indexInvite = await user.contact_list.findIndex(contact => contact.contact_id.toString() === contct_id);

    if(indexInvite !== -1){
        // delete the invite from the invitations list
        user.contact_list.splice(indexInvite, 1);
        // save the updates
        await user.save();
    }

    console.log(user)
    res.send({ message: "contact delete" })
});

export {getAllContacts, createContact, deleteContact};