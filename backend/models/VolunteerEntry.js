const mongoose = require('mongoose');

const entryItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'count' },
    category: { type: String, default: 'General' },
  },
  { _id: false }
);

const volunteerEntrySchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    volunteerName: { type: String, required: true },
    items: [entryItemSchema],
  },
  { timestamps: true }
);

volunteerEntrySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.shipmentId = ret.shipmentId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('VolunteerEntry', volunteerEntrySchema);
