import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/userModels.js';
import bcrypt from 'bcrypt';

const Fields = {
    usernameField: 'email',
    passwordField: 'password'
}

const verifyCallBack = async (username, password, done) => {
    try{
        // Find the user using the email
        const user = await User.findOne({ email: username });

        // verify if a user was found
        if(!user){
            return done(null, false, { message: 'Incorrect email'})
        }

        // Verify the password
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

passport.use(new LocalStrategy(Fields, verifyCallBack));

// Serialize the user from the session
passport.serializeUser((user,done) => {
    done(null, user.id);
});

// De-serialize the user from the session
passport.deserializeUser( async(id, done) => {
    try{
        // Find the user by ID
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err);
    }
});

export default passport;