// Load environment variables from a .env file (if present)
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');              // <-- ADD MORGAN


const app = express(); // <-- call express() to create the app instance
const {MongoClient} = require('mongodb'); // import mongo client
const path = require('path');
const cors = require('cors');
app.use(cors());
app.use(morgan('dev'));                        // <-- USE MORGAN HERE

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.json());  // Pase JSON request bodies
app.use(express.urlencoded({ extended: true }));


app.use('/images', express.static(path.join(__dirname, 'images')));

// Set the MongoDB Atlas URI from environment variables
const uri = process.env.DATABASE_URL; 
let db; // Placeholder for the database connection


// Connect to MongoDB using the MongoDB native driver.
MongoClient.connect(uri)
    .then(client => {
        console.log('Connected to MongoDB Atlas');
        db = client.db('lessons'); // Set the database to interact with (use the default database or specify one)
         // Import routes *after* connection so we can pass db to them
        const myroutes = require('./routes/theroutes')(db);
        app.use('/lessons', myroutes);

    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1); // Exit the app if connection fails
    });




// Start the HTTP server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

