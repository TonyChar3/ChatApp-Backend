import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/userModels.js';
import bcrypt from 'bcrypt';

const Fields = {
    // What to use in the request for the authentication
    usernameField: 'email',// req.body.email
    passwordField: 'password'// req.body.password
}

const verifyCallBack = async (username, password, done) => {
    try{
        // Find the user in the DB using the email
        const user = await User.findOne({ email: username });

        // verify if a user was found
        if(!user){
            return done(null, false, { message: 'Incorrect email'})
        }

        // Verify the password hash using bcrypt
        const isMatch = await bcrypt.compare(password, user.password)

        // check if the the password match
        if(!isMatch){
            return done(null, false, { message: 'Incorrect password'})
        }

        // if everything is fine return the user
        return done(null, user);

    } catch(err){
        return done(err);
    }
};

passport.use(new LocalStrategy(Fields, verifyCallBack));// Using passport JS LocalStrategy for authentication

// Serialize the user from the session
passport.serializeUser((user,done) => {
    // return the user id
    done(null, user.id);
});

// De-serialize the user from the session
passport.deserializeUser( async(id, done) => {
    try{
        // Find the user by ID
        const user = await User.findById(id);
        // return the whole user
        done(null, user);
    } catch(err) {
        done(err);
    }
});

export default passport;