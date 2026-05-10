const mongoose = require('mongoose');

const catalogItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    unit: { type: String, default: 'count' },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    standardized: { type: Boolean, default: false },
    postedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

catalogItemSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
