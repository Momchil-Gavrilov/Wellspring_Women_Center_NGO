const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'approved'],
      default: 'open',
    },
    period: { type: String, default: null }, // e.g. "May 10-23"
  },
  { timestamps: true }
);

// Always return _id as id for frontend compatibility
shipmentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Shipment', shipmentSchema);
