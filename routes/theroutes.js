// Example route file: routes/theroutes.js
module.exports = (db) => {
    const express = require('express');
    const router = express.Router();

    // Get all products
    router.get('/', async (req, res) => {
        try {
            const products = await db.collection('afterschool-lessons').find().toArray(); // Query to fetch all products
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    });

    // Get a single lesson by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonsCollection = db.collection('afterschool-lessons');

        // Ensure lessonid is a valid ObjectId
        if (ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid lesson ID format' });
        }


        
            let query;

            // If it's a valid ObjectId, search by _id
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                // Otherwise, assume it's a string or numeric lessonId
                // Adjust this depending on your schema
                query = { lessonId: id };  
            }

            const lesson = await lessonsCollection.findOne(query);
            
                if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json(lesson);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching lesson', error });
        }
    });

           
    

    // Add a new product
    router.post('/', async (req, res) => {
        // Log the request body to see what’s coming in
        console.log('Request body:', req.body);  // <-- This will help debug

        try {
            // Check if the body is actually present and valid
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is missing' });
            }

            // Ensure we have the required fields and remove _id if it's passed in
            const { _id, ...newProduct } = req.body;

            // Optional: Validate the data before inserting (e.g., check if all required fields are there)
            if (!newProduct.title || !newProduct.price) {
                return res.status(400).json({ message: "Title and price are required!" });
            }

            // Insert the product into the database
            const result = await db.collection('afterschool-lessons').insertOne(newProduct);

            // The result will contain the insertedId
            const insertedProduct = { ...newProduct, _id: result.insertedId };

            // Send back the created product
            res.status(201).json(insertedProduct);
        } catch (error) {
            console.error('Error adding product:', error);  // log full error in console for debugging
            res.status(500).json({ message: 'Error adding product', error: error.message });
        }
    });

    return router; // Return the router to be used in the main app
    };


    // Add a new product

    /*
    router.post('/', async (req, res) => {
                console.log('Request body:', req.body); // <-- log the body

        try {
            
            const newProduct = req.body;
            const result = await db.collection('products').insertOne(newProduct); // Insert a new product
            res.status(201).json(result.ops[0]); // Send back the created product
        } catch (error) {
            res.status(500).json({ message: 'Error adding product', error: error.message });
        }
    });
       /*


     Add a new product
    router.post('/', async (req, res) => {
        console.log('Request body:', req.body); // <-- log the body to inspect it

        try {
            // Ensure we have the required fields (like title, price, etc.) and remove _id if it's passed in
            const { _id, ...newProduct } = req.body;

            // Optional: Validate the data before inserting (e.g., check if all required fields are there)
            if (!newProduct.title || !newProduct.price) {
                return res.status(400).json({ message: "Title and price are required!" });
            }

            // Insert the product into the database
            const result = await db.collection('products').insertOne(newProduct);

            // Send back the created product
            res.status(201).json(result.ops[0]);
        } catch (error) {
            console.error('Error adding product:', error);  // log full error in console for debugging
            res.status(500).json({ message: 'Error adding product', error: error.message });
        }
*/