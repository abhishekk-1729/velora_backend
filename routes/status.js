const express = require('express');
const { createStatus, getAllStatuses, getStatusByOrderId, deleteStatus } = require('../controllers/status');
const router = express.Router();

router.post('/createStatus', createStatus);
router.get('/getAllStatuses', getAllStatuses);
router.get('/getStatus/order/:order_id', getStatusByOrderId);
router.delete('/:id', deleteStatus);

module.exports = router;
