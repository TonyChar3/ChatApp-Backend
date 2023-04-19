import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import User from '../models/userModels.js';

//@desc Register new user
//@route POST /user/register
//@access public
const registerUser = asyncHandler( async (req,res, next) => {

    try{
        // deconstruct the user info from the request body
        const { username, email, password } = req.body

        // check if nothing is empty
        if(!username || !email || !password){
            // send status of 400
            res.status(400);
            // throw a the Error for the client to see
            throw new Error("All fields are mandatory");
        }

        // check if it isn't already registered inside the DB
        const userAvailable = await User.findOne({ email })

        // if true ( there is a user using the same email )
        if(userAvailable){
            // send status of 400 from the server
            res.status(400);
            // throw an error for the client to see
            throw new Error("User is already registered")
        }

        // hash the password with bcrypt
        const hashPassword = await bcrypt.hash(password, 10);

        // create a new user to store inside the DB
        // -> the .create() function create the object and store it inside the DB
        const user = await User.create({
            username,
            email,
            password: hashPassword,// to use the hashed password to be stored inside the DB
        });

        // check if the user was correctly created
        if(user){
            res.status(201).json({ _id: user.id, email: user.email })
        } else {
            res.status(400);
            throw new Error("User data not valid!");
        }

        // respond with success message via json
        res.send({ message: "user registered"});

    } catch(err){
        next(err)
    }
});

//@desc Logout the current user
//@route GET /user/logout
//@access public
const logoutUser = asyncHandler( async(req,res,next) => {
    // logout solution with passportJS localstrategy
    try{
        req.logout(function(err){
            if(err) { return next(err); }
            res.redirect('/login')
        })
    } catch(err){
        next(err)
    }
});

//@desc The current user
//@route GET /user/current
//@access private
const currentUser = asyncHandler( async(req,res,next) => {
    try{
        // send back the complete user object using JSON
        res.status(200).json(req.user);
    } catch(err){
        next(err)
    }
});

export {registerUser, logoutUser, currentUser};