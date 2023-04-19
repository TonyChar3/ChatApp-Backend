import express from 'express';
import {getAllContacts, createContact, deleteContact} from '../controllers/contactController.js';
import isAuth from '../middleware/authHandler.js';
const router = express.Router();

/**
 * Route for contacts operations
 */

// verify if the user is authenticated
router.use(isAuth);

router.route('/contact').get(getAllContacts).post(createContact).delete(deleteContact)

export default router;