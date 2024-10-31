const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    dates: {
        type: Map,
        of: Date,
        default: {
            advance_payment: null,
            ui_discussion: null,
            ui_started: null,
            ui_completed: null,
            client_review: null,
            dev_started: null,
            dev_completed: null,
            initial_quality: null,
            deployment_started: null,
            deployment_completed: null,
            precision_review: null,
            final_review: null,
            launch_readiness: null,
            remaining_payment: null,
            website_delivery: null
        }
    },
    completed_steps: { type: Number, default: 0 }
});

module.exports = mongoose.model('Status', statusSchema);
