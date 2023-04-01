import express from 'express';
// import validateToken from '../middleware/validToken';
const router = express.Router();

// router.use(validateToken);

router.route('/contact').get((req,res) => {
    res.send({ message: "your list of contacts"})
})

router.route('/contact').post((req,res) => {
    res.send({ message: "create contact"})
})

router.route('/contact/:id').get((req, res) => {
    res.send({ message: "The contact you searched for"})
})

router.route('/contact/:id').put((req,res) => {
    res.send({ message: "contact update"})
})

router.route('/contact/:id').delete((req, res) => {
    res.send({ message: "contact delete" })
})

export default router;