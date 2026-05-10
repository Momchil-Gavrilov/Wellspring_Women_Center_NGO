const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const VolunteerEntry = require('../models/VolunteerEntry');

// GET /api/shipments — list all shipments
router.get('/', async (_req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shipments — create a new shipment
router.post('/', async (req, res) => {
  try {
    const { name, date, period } = req.body;
    const shipment = await Shipment.create({ name, date, period });
    res.status(201).json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/shipments/:id — get a single shipment
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shipments/:id — update shipment status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/shipments/:id/entries — get all volunteer entries for a shipment
router.get('/:id/entries', async (req, res) => {
  try {
    const entries = await VolunteerEntry.find({ shipmentId: req.params.id });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shipments/:id/entries — save/overwrite a volunteer's entry sheet
router.post('/:id/entries', async (req, res) => {
  try {
    const { volunteerName, items } = req.body;
    // Upsert: one entry per volunteer per shipment
    const entry = await VolunteerEntry.findOneAndUpdate(
      { shipmentId: req.params.id, volunteerName },
      { items },
      { upsert: true, new: true }
    );
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/shipments/:id/sum — aggregated sum sheet for a shipment
router.get('/:id/sum', async (req, res) => {
  try {
    const entries = await VolunteerEntry.find({ shipmentId: req.params.id });
    const sumMap = {};

    for (const entry of entries) {
      for (const item of entry.items) {
        const key = item.itemName.toLowerCase();
        if (!sumMap[key]) {
          sumMap[key] = {
            itemName: item.itemName,
            count: 0,
            unit: item.unit,
            category: item.category,
          };
        }
        sumMap[key].count += item.count;
      }
    }

    res.json(Object.values(sumMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
