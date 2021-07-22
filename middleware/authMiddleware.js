const jwt = require("jsonwebtoken");

//configure dotenv
require("dotenv").config();

// ensure user is authenticated
const requiresAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if(token){
        jwt.verify(token, process.env.JWTSECRET, (err, decodedToken) => {
            if(err){
                console.log(err)
                res.status(400).json({error: "bad token"});
            }else{
                console.log(decodedToken);
                next();
            }
        })   
    }else{
        res.status(400).json({error: "bad auth: user not authorized"})
    }
}

module.exports = {requiresAuth}