const mongoose = require('mongoose');

require('dotenv').config();

// Define the Mongo db connection URL

const mongoURL = process.env.MONGODB_URL_LOCAL;  // voting is the database name

//const mongoURL = process.env.MONGODB_URL;

// Setup Mongo db connection

mongoose.connect(mongoURL,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

// Get the default connection
// Mongoose maintains a default connection object representing the mongoDB connection

const db = mongoose.connection;


// Define event listener for database connection

db.on('connected',()=>{
    console.log('Connected to MongoDB server');
})

db.on('error',(err)=>{
    console.error('MongoDB conection error',err);
})

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
})


// Exports the database connection

module.exports = db;