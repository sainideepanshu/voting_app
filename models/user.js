const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


// Define user schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['voter','admin'],
    default: 'voter',
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});


userSchema.pre('save',async function(next){

  const user = this;

  // hash the password only if it has been modified or is new

  if(!user.isModified('password')){  // agar hum maan lo salary modify kar rahe hai to us case m password hash karne ki koi zarurat nahi hai
    return next();
  }

  try{

    // hash password generation

    const salt = await bcrypt.genSalt(10);

    // hash password 

    const hashedPassword = await bcrypt.hash(user.password,salt);

    // override the plain password with the hashed one

    user.password = hashedPassword;

    next();

  }catch(err){
    return next(err);
  }

});


userSchema.methods.comparePassword = async function(candidatePassword){

  try{

    // use bcrypt to compare the provided password with the hashed password stored in database

    const isMatch = await bcrypt.compare(candidatePassword,this.password);

    return isMatch;

  }catch(err){

    throw err;
  }

}


// Now we will create model using the schema created above

const User = mongoose.model('User',userSchema);

module.exports = User;