const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    completed_steps: { type: Number, required: true }
});

const Status = mongoose.model('Status', StatusSchema);
module.exports = Status;
