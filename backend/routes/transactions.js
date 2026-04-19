const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: 1, createdAt: 1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET transactions by type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const transactions = await Transaction.find({ type }).sort({ date: 1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET transactions by date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate) query.date = { $gte: startDate };
        if (endDate) query.date = { ...query.date, $lte: endDate };
        
        const transactions = await Transaction.find(query).sort({ date: 1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new transaction
router.post('/', async (req, res) => {
    try {
        const { type, date, time, vehicle, amount } = req.body;
        
        // Validation
        if (!type || !date || !amount) {
            return res.status(400).json({ error: 'Missing required fields: type, date, amount' });
        }
        
        const transaction = new Transaction({
            type,
            date,
            time: time || null,
            vehicle: vehicle || 'N/A',
            amount
        });
        
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST bulk create transactions
router.post('/bulk', async (req, res) => {
    try {
        const { transactions } = req.body;
        
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Transactions array is required' });
        }
        
        const savedTransactions = await Transaction.insertMany(transactions);
        res.status(201).json(savedTransactions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, date, time, vehicle, amount } = req.body;
        
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            { type, date, time, vehicle, amount },
            { new: true, runValidators: true }
        );
        
        if (!updatedTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE all transactions
router.delete('/', async (req, res) => {
    try {
        await Transaction.deleteMany({});
        res.json({ message: 'All transactions deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE single transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTransaction = await Transaction.findByIdAndDelete(id);
        
        if (!deletedTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET summary statistics
router.get('/summary', async (req, res) => {
    try {
        const { month } = req.query;
        let matchQuery = {};
        
        if (month) {
            matchQuery.date = { $regex: `^${month}` };
        }
        
        const summary = await Transaction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;