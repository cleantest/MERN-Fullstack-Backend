// Example route file: routes/theroutes.js
module.exports = (db) => {
    const express = require('express');
    const router = express.Router();
    const { ObjectId } = require('mongodb');



      const lessonsCollection = db.collection('afterschool-lessons');

      const ordersCollection = db.collection('orders');

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

  // Get one lesson by custom lessonId
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = {
      id: isNaN(id) ? id : Number(id)
    };

    const lesson = await lessonsCollection.findOne(query);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    else {
    res.json(lesson);}
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Error fetching lesson', error: error.message });
  }
});
       
    router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Convert to ObjectId if it's a valid MongoDB ID
    const query = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null
    };

    // Check if the ID is valid
    if (!query._id) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Attempt to delete the lesson
    const result = await lessonsCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Successfully deleted
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting the lesson:', error);
    res.status(500).json({ message: 'Error deleting the lesson', error: error.message });
  }
});




    // update a lesson by ID

 router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Convert to ObjectId if it's a valid MongoDB ID
    const query = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null
    };

    // Check if the ID is valid
    if (!query._id) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Attempt to update the lesson
    const result = await lessonsCollection.updateOne(query,
      { $set: updatedData}
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Successfully deleted
    res.json({ message: 'Lesson updated successfully', updatedLesson: updatedData  });
  } catch (error) {
    console.error('Error updating the lesson:', error);
    res.status(500).json({ message: 'Error updating the lesson', error: error.message });
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

    // CREATE a new order
  router.post('/order', async (req, res) => {
      try {
          const { name, phone } = req.body;

          // Validate required fields
          if (!name || !phone) {
              return res.status(400).json({ error: "name and phone are required" });
          }

          // Create order doc
          const order = {
              name,
              phone,
              createdAt: new Date()
          };

          const result = await db.collection('orders').insertOne(order);

          res.status(201).json({
              message: "Order created successfully",
              orderId: result.insertedId
          });

      } catch (err) {
          res.status(500).json({ error: err.message });
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