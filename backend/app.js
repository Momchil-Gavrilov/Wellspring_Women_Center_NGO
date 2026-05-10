const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Serverless-safe DB connection — reuses existing connection on warm invocations
let connected = false;
app.use(async (req, _res, next) => {
  if (connected && mongoose.connection.readyState === 1) return next();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI env var is not set!');
    return next(new Error('MONGODB_URI is not configured'));
  }
  try {
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(uri);
    connected = true;
    console.log('[DB] Connected. Request:', req.method, req.url);
    next();
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    next(err);
  }
});

app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/pricing', require('./routes/pricing'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: !!process.env.MONGODB_URI }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

module.exports = app;
