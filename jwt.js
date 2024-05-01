const jwt = require('jsonwebtoken');

// routes ko access karne k liye token nahi hai to unauthorized aur agar hai to verify karenge ki it is the correct token or not

const jwtAuthMiddleware = (req,res,next) => {

    // first check the request header has authorization or not

    const authorization = req.headers.authorization;

    if(!authorization){
        return res.status(401).json({error : 'Token not found'});
    }



    // Extract the JWT token from the request header

    const token = req.headers.authorization.split(' ')[1];

    if(!token){  // token is null
        return res.status(401).json({error : 'Unauthorized'});
    }

    try{

        // Verify the JWT token 

        // jab JWT token ko verify kar lega and verification is success or token is correct to jwt.verify() humko return kardega ek payload , ye wahi payload hai jo humne use kara tha is token ko create karte waqt
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        // Attach user information/payload to the request object , jo bhi token mai data rehta hai us data ko hum extract kar lete hai

        req.user = decoded;

        next();

    }catch(err){

        console.log(err);
        res.status(401).json({error : 'invalid token'});
    }
}


// Function to generate JWT token

const generateToken = (userData) => {

    // Generate a new JWT token using user data

    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn : 30000});
}




module.exports = {jwtAuthMiddleware, generateToken};