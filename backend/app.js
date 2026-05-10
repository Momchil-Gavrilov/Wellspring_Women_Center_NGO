const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Serverless-safe DB connection — reuses existing connection on warm invocations
let connected = false;
app.use(async (_req, _res, next) => {
  if (connected && mongoose.connection.readyState === 1) return next();
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/pricing', require('./routes/pricing'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

module.exports = app;
