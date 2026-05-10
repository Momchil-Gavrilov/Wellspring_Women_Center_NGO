const mongoose = require('mongoose');

// Persists $/unit values per item — only updated when bookkeeper changes them
const priceEntrySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, unique: true },
    unit: { type: String, default: 'count' },
    dollarsPerUnit: { type: Number, required: true, default: 0 },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

priceEntrySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('PriceEntry', priceEntrySchema);
