require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const shipmentsRouter = require('./routes/shipments');
const catalogRouter = require('./routes/catalog');
const pricingRouter = require('./routes/pricing');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/shipments', shipmentsRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/pricing', pricingRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
