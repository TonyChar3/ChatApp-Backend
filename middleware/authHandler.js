/**
 * Middle ware to check if the user making the request is authenticated
 * @param {The user info in the request} req 
 * @param {*} res 
 * @param {*} next 
 */

const isAuth = (req,res,next) => {
    if(req.isAuthenticated()){
        next();
    } else {
        res.status(401).json({ msg: 'You are not authenticated'})
    }
}

export default isAuth;