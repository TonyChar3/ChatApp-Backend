import express from 'express';
import isAuth from '../middleware/authHandler.js';
import { acceptInvite, declineInvite, allInvites } from '../controllers/inviteController.js';
const router = express.Router();

/**
 * Routes for the invitations operations
 */

// verify if the user is authenticated
router.use(isAuth)

router.route('/invites').get(allInvites);

router.route('/accept').delete(acceptInvite);

router.route('/decline').delete(declineInvite);

export default router;