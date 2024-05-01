const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");

// POST route to add a user

router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the req.body contains the user data

    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
        return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
        return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingUser) {
        return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
    }

    // Create a new user document using mongoose model

    const newUser = new User(data);

    // Save the new user to the database

    const response = await newUser.save();

    console.log("data saved ", response);

    const payload = {
      id : response.id,
    }

    console.log(JSON.stringify(payload));

    const token = generateToken(payload);

    console.log("token is : " , token);

    console.log("data saved successfully");

    res.status(200).json({response : response,token : token});

  } catch (err) {
    console.log("Error saving user", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});


// Login Route 

router.post('/login', async (req,res) => {

  try{

    // Extract aadharCardNumber and password from request body

    const {aadharCardNumber,password} = req.body;

    // check karo ki user exist karta hai ya nahi in database

    const user = await User.findOne({aadharCardNumber : aadharCardNumber});

    // If user does not exist or password does not match then return error

    if( !user || !( await user.comparePassword(password))){

      return res.status(401).json({error : 'Invalid aadharCardNumber or password'});
    }

    // Now user is an authenticated user , now generate token

    const payload = {
      id : user.id,
    }

    const token = generateToken(payload);

    // return token as response 

    return res.json({token});

  }catch(err){
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }

})


// Profile route 

router.get('/profile', jwtAuthMiddleware,async (req,res) => {

  try{
    
    const userData = req.user;  // we are getting this req.user from the jwt.js file 
    console.log("User Data :: ",userData);

    const userId = userData.id;

    const user = await User.findById(userId);

    res.status(200).json({user});

  }catch(err){
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }

});

router.put('/profile/password',jwtAuthMiddleware ,async (req,res) => {
  try{

      const user_id = req.user.id; // Extract the id from the token

      const {currentPassword,newPassword} = req.body;  // Extract current and new password from the request body

      // Find the user by id

      const user = await User.findById(user_id);

      // If current password does not match then return error

      if( !( await user.comparePassword(currentPassword))){

        return res.status(401).json({error : 'Invalid current password'});
      }
      
      // Now as the current password matched 
      // Update the password with new password

      user.password = newPassword;
      await user.save();

      console.log("password updated");
      res.status(200).json({message:"Password updated"});

  }catch(err){
    console.log("Error updating password ", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});


module.exports = router;