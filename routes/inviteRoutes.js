import express from 'express';
import isAuth from '../middleware/authHandler.js';
import { acceptInvite, declineInvite, allInvites } from '../controllers/inviteController.js';
const router = express.Router();

router.use(isAuth)

router.route('/invites').get(allInvites);

router.route('/accept').delete(acceptInvite);

router.route('/decline').delete(declineInvite);

export default router;