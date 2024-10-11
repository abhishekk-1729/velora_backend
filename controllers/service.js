const Service = require('../models/service');

// 1. Add a new Service
exports.addService = async (req, res) => {
    const { service_name, originalPrice } = req.body;

    try {
        const newService = new Service({ service_name, originalPrice });
        await newService.save();
        res.status(201).json({ success: true, message: 'Service added successfully', service: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get all Services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Service by ID
exports.getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.status(200).json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update a Service by ID
exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { service_name, originalPrice } = req.body;

    try {
        const updatedService = await Service.findByIdAndUpdate(id, { service_name, originalPrice }, { new: true });
        if (!updatedService) return res.status(404).json({ success: false, message: 'Service not found' });
        res.status(200).json({ success: true, message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete a Service by ID
exports.deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) return res.status(404).json({ success: false, message: 'Service not found' });
        res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
