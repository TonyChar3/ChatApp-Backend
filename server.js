import express from 'express';
import dotenv from 'dotenv';
import https from 'https';
import path from 'path';
import fs from 'fs';
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
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';

// to use .env file envrionment variables
dotenv.config();

// to connect to the DB
connectDB();

// use the express framework
const app = express();

// set the port
const port = process.env.PORT || 5002;

// to be able to use json with express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// to secure the routes
app.use(helmet());

// Cross-origin Resource sharing
app.use(cors());

/**
 * Connect the Session store with the DB
 * -> And create a collection 'sessions' to store it
 */
const MongoDBStore = connectMongoDBSession(expSession);

const sessionStore = new MongoDBStore({
    uri: process.env.CONNECTION_STRING,
    collection: 'sessions'
})

// Use the session store
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

// configuration for PassportJS
confPassport;

// initialize passportjs
app.use(passport.initialize());
// use passport session
app.use(passport.session());

// use the routes
app.use("/contacts", contactRoutes);// contacts
app.use("/user", userRoutes);// user 
app.use("/invitations", inviteRoute);// invitation
app.use("/chat", msgRoutes);// chat room

// handle the error with the middleware
app.use(errorHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up HTTPS for secure request to the server
const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app);

// start
sslServer.listen(port, () => {
    console.log(`Secure server is running on port ${port}`);
});