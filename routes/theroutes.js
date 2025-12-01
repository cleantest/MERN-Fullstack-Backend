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

        //  Check if image file exists in /images folder
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


// Update ANY fields for a lesson
router.put('/:id', async (req, res) => {
    const lessonId = parseInt(req.params.id);
    const updateData = req.body;

    // Validate lesson ID 
    if (isNaN(lessonId)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
    }

    // Validate request body has at least 1 field to update
    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No data provided for update" });
    }

    try {
        const result = await lessonsCollection.updateOne(
            { id: lessonId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        res.json({
            success: true,
            message: "Lesson updated successfully",
            updatedFields: updateData
        });
    } catch (err) {
        console.error("Error updating lesson:", err);
        res.status(500).json({ error: err.message });
    }
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
       
    
    return router; // Return the router to be used in the main app
};
    
