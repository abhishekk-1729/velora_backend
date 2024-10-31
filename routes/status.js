const express = require('express');
const { createStatus, getAllStatuses, getStatusByOrderId, deleteStatus, getStatusDates } = require('../controllers/status');
const router = express.Router();
const authMiddleware = require("../middleware/auth")

router.post('/createStatus', createStatus);
// router.get('/getAllStatuses', getAllStatuses);
router.get('/getStatus/order/:order_id', authMiddleware, getStatusByOrderId);
// router.delete('/:id', deleteStatus);

module.exports = router;
