
const express = require('express');
const uploadController = require('../controllers/upload-image');
const multer = require('multer');

const router = express.Router();

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/uploadImage', upload.single('image'), uploadController.uploadImage);


// Route for uploading images
router.get('/getImage/:id', uploadController.getImage); // New route for retrieving images
// Route for fetching images
// router.get('/image/:filename', uploadController.getImage);

module.exports = router;
