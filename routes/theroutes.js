// Example route file: routes/theroutes.js
const path = require('path');
const fs = require('fs');


module.exports = (db) => {
    const express = require('express');
    const router = express.Router();
    
    const { ObjectId } = require('mongodb');


 //MongoDB collections
      const lessonsCollection = db.collection('afterschool-lessons');
      const ordersCollection = db.collection('orders');

   // Get all lessons
 router.get('/', async (req, res) => {
        try {
            const products = await db.collection('afterschool-lessons').find().toArray(); // Query to fetch all products
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    });

    //Add a lesson

router.post('/', async (req, res) => {
    console.log("Request body:", req.body);

    try {
        // valid body check
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { _id, ...newLesson } = req.body;

        // Validate required fields
        if (!newLesson.subject || !newLesson.price) {
            return res.status(400).json({ message: "Subject and price are required" });
        }

        newLesson.price = Number(newLesson.price);

        // Validate & normalize the icon field
        if (!newLesson.icon) {
            return res.status(400).json({ message: "Image (icon) is required" });
        }

        // Remove leading /images/ if present, normalize
        let filename = newLesson.icon.replace('images/', '');
        const imagePath = path.join(__dirname, '..', 'images', filename);

        // ❗ Check if image file exists in /images folder
        if (!fs.existsSync(imagePath)) {
            return res.status(400).json({
                message: "Image file does not exist on server",
                missingFile: filename
            });
        }

        // Put /images/ back before saving to DB
        newLesson.icon = 'images/' + filename;

        // Now insert lesson because image is valid
        const result = await db.collection('afterschool-lessons').insertOne(newLesson);

        res.status(201).json({
            message: "Lesson added successfully",
            lesson: { ...newLesson, _id: result.insertedId }
        });

    } catch (err) {
        console.error("Error adding lesson:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

//Serving images statically
    router.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;

    // Path to the images folder
    const imagePath = path.join(__dirname, '..','images', filename);

    // Check if file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: "Image not found" });
        }

        res.sendFile(imagePath);
    });
});

  
// Create a lessons order
router.post('/order', async (req, res) => {
    try {
        const { parentName, phone, items, total } = req.body;

        console.log("Incoming order:", req.body);

        if (!parentName || !phone || !items || items.length === 0) {
            return res.status(400).json({ error: "Missing order fields" });
        }

        // Convert numeric lesson ids to query format
        const lessonIds = items.map(i => i.id);

        // Get lessons that match the IDs
        const lessons = await lessonsCollection
            .find({ id: { $in: lessonIds } })
            .toArray();

        if (lessons.length !== lessonIds.length) {
            return res.status(400).json({ error: "One or more lessons not found" });
        }

        const order = {
            parentName,
            phone,
            items,      
            lessonIds,  
            total,
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(order);

        res.status(201).json({
            success: true,
            orderId: result.insertedId,
            order
        });
    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ error: err.message });
    }
});

//Update available spaces for a lesson
router.put('/:id/spaces', async (req, res) => {
    const lessonId = parseInt(req.params.id);
    const { spaces } = req.body;

    if (isNaN(lessonId)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
    }

    const result = await lessonsCollection.updateOne(
        { id: lessonId },
        { $set: { spaces: spaces } }
    );

    res.json({ success: result.modifiedCount > 0 });
});

//Get all orders
  router.get('/order', async (req, res) => {
        try {
            const myorders = await db.collection('orders').find().toArray(); // Query to fetch all products
            res.json(myorders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders', error });
        }
    });

   
 // Get one order by custom userId
router.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;

  // Convert to ObjectId if it's a valid MongoDB ID
    const query = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null
    };

    const theorder = await ordersCollection.findOne(query);

    if (!theorder) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    else {
    res.json(theorder);}
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Error fetching lesson', error: error.message });
  }
});

//Delete an order by ID
router.delete('/order/:id', async (req, res) => {
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
    const result = await ordersCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Successfully deleted
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting the order:', error);
    res.status(500).json({ message: 'Error deleting the order', error: error.message });
  }
});// GET order with lesson details using MongoDB lookup
router.get('/order/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid order ID" });
        }
// Define the aggregation pipeline
        const pipeline = [
            { $match: { _id: new ObjectId(id) } },
            {   // Lookup to join with afterschool-lessons collection
                $lookup: {
                    from: "afterschool-lessons",
                    localField: "lessons",
                    foreignField: "_id",
                    as: "lessonDetails"
                }
            }
        ];
// Execute the aggregation
        const result = await ordersCollection.aggregate(pipeline).toArray();

        if (result.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(result[0]);

    } catch (err) {
        console.error("Lookup error:", err);
        res.status(500).json({ error: err.message });
    }
});


   // Update a lesson by ID
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

    return router; // Return the router to be used in the main app
};
    
