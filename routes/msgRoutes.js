import express from 'express';
import isAuth from '../middleware/authHandler.js';
import { newChatMsg, deleteChatMsg, allChatMsg } from '../controllers/msgControllers.js';

const router = express.Router();

router.use(isAuth);

// Add a new message
router.route('/newMsg').post(newChatMsg)

// delete the message
router.route('/deleteMsg').delete(deleteChatMsg)

// see all the messages
router.route('/chatMsg').get(allChatMsg)

export default router;