const express = require('express');
const router = express.Router();
const CatalogItem = require('../models/CatalogItem');

// GET /api/catalog — list all catalog items
router.get('/', async (_req, res) => {
  try {
    const items = await CatalogItem.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalog — add a new catalog item (from volunteer or manager)
router.post('/', async (req, res) => {
  try {
    const { name, unit, category, description, postedBy } = req.body;
    // Use findOneAndUpdate to avoid duplicate key errors (case-insensitive)
    const item = await CatalogItem.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { name, unit, category, description, postedBy },
      { upsert: true, new: true }
    );
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/catalog/:id — manager standardizes an item
router.put('/:id', async (req, res) => {
  try {
    const { name, unit, category, description } = req.body;
    const item = await CatalogItem.findByIdAndUpdate(
      req.params.id,
      { name, unit, category, description, standardized: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/catalog/:id — manager removes a duplicate/bad item
router.delete('/:id', async (req, res) => {
  try {
    await CatalogItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
