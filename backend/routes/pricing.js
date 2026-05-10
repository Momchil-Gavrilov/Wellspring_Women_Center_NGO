const express = require('express');
const router = express.Router();
const PriceEntry = require('../models/PriceEntry');

// GET /api/pricing — get all persisted price entries
router.get('/', async (_req, res) => {
  try {
    const prices = await PriceEntry.find().sort({ itemName: 1 });
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pricing/:itemName — upsert price for an item (persists forward)
router.put('/:itemName', async (req, res) => {
  try {
    const { unit, dollarsPerUnit, updatedBy } = req.body;
    const itemName = decodeURIComponent(req.params.itemName);
    const entry = await PriceEntry.findOneAndUpdate(
      { itemName },
      { unit, dollarsPerUnit, updatedBy },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/pricing/:itemName — remove a price entry
router.delete('/:itemName', async (req, res) => {
  try {
    const itemName = decodeURIComponent(req.params.itemName);
    await PriceEntry.findOneAndDelete({ itemName });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
