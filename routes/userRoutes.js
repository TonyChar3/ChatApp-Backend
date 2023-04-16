import express from 'express';
import { registerUser, logoutUser, currentUser } from '../controllers/userController.js';
import isAuth from '../middleware/authHandler.js';
import passport from 'passport';
const router = express.Router();


router.post('/register', registerUser)

router.post('/login', passport.authenticate('local', { failureRedirect:'/user/login', failureMessage: true, successRedirect: '/user/current' }))

router.get('/logout', logoutUser)

router.get('/current', isAuth, currentUser)

export default router;