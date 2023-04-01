import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModels.js';

//@desc Register new user
//@route POST /user/register
//@access public
const registerUser = asyncHandler( async (req,res) => {
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

    res.send({ message: "user registered"});
});

//@desc login the user
//@route POST /user/login
//@access public
const loginUser = asyncHandler( async (req,res) => {
    // deconstruct the data from the request body
    const { email, password } = req.body;
    // verify if there's no empty data
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill out all mandatory fields")
    }
    // check the db for the matching data
    const user = await User.findOne({ email })

    if(user && (await bcrypt.compare(password, user.password))){
        // login and create a new JWT token
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m"}
        );
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    
    res.send({ message: "user login"});
});

//@desc The current user
//@route GET /user/current
//@access private
const currentUser = asyncHandler( async(req,res) => {
    res.json(req.user);
});

export {registerUser, loginUser, currentUser};