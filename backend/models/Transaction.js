const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['fuel', 'advance', 'credit']
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        default: null
    },
    vehicle: {
        type: String,
        default: 'N/A'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
transactionSchema.index({ type: 1, date: 1 });
transactionSchema.index({ date: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);