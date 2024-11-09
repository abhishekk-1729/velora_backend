// imageController.js

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


// Define a Mongoose schema for the image
const imageSchema = new mongoose.Schema({
    image: {
        data: Buffer,
        contentType: String
    }
});

// Create a Mongoose model
const Image = mongoose.model('Image', imageSchema);

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Upload Image Function
// Upload Image Function
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Create a new image instance
        const newImage = new Image({
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        // Save the image to the database
        const savedImage = await newImage.save();
        
        // Send the image ID in the response
        res.status(200).send({ message: 'Image uploaded successfully.', id: savedImage._id });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image.');
    }
};


const getImage = async (req, res) => {
    try {
        const { id } = req.params; // Get image ID from URL parameters
        const image = await Image.findById(id);

        if (!image) {
            return res.status(404).send('Image not found.');
        }

        // Set content type and send image data
        res.contentType(image.image.contentType);
        res.send(image.image.data);
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).send('Error retrieving image.');
    }
};


// Export the router
module.exports = {uploadImage, getImage};