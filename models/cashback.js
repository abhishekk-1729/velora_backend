const mongoose = require('mongoose');

const CashbackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cashback_percent: { type: Number, required: true },
});

const Cashback = mongoose.model('Cashback', CashbackSchema);
module.exports = Cashback;
