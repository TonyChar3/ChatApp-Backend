import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import inviteRoute from './routes/inviteRoutes.js';
import msgRoutes from './routes/msgRoutes.js';
import expSession from 'express-session';
import { default as connectMongoDBSession } from 'connect-mongodb-session';
import passport from 'passport';
import confPassport from './config/passport.js';

dotenv.config();
connectDB();


const app = express();
const port = process.env.PORT || 5002;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Connect the Session store with the DB
 * -> And create a collection 'sessions' to store it
 */
const MongoDBStore = connectMongoDBSession(expSession);
const sessionStore = new MongoDBStore({
    uri: process.env.CONNECTION_STRING,
    collection: 'sessions'
})

// use the session
app.use(expSession({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 30 * 24 * 60 * 60
        // secure: true -> activate only if the web app is HTTPS secured
    },
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    name: 'chatapp-session',
    rolling: false
}))

confPassport;

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
    console.log(req.session)
    console.log(req.user)
    next();
});



app.use("/contacts", contactRoutes);
app.use("/user", userRoutes);
app.use("/invitations", inviteRoute);
app.use("/chat", msgRoutes);
app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});