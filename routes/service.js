const express = require('express');
const serviceController = require('../controllers/service');
const router = express.Router();

// Routes for Service operations
router.post('/addService', serviceController.addService);          // Add a new service
// router.get('/getAllServices', serviceController.getAllServices);   // Get all services
// router.get('/getServiceById/:id', serviceController.getServiceById); // Get a service by its ID
// router.put('/updateService/:id', serviceController.updateService); // Update service by ID
// router.delete('/deleteService/:id', serviceController.deleteService); // Delete service by ID

module.exports = router;
