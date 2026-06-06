import mongoose from 'mongoose';

const rfqItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  unit: { type: String, required: true },
  notes: String,
  sortOrder: { type: Number, default: 0 }
});

const rfqSchema = new mongoose.Schema({
  rfqNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: String,
  budget: Number,
  deadline: { type: Date, required: true },
  deliveryDate: { type: Date },
  description: String,
  status: { type: String, enum: ['Draft', 'Published', 'Closed', 'Cancelled', 'Under Review', 'Approved', 'Rejected'], default: 'Draft' },
  items: [rfqItemSchema],
  attachments: [{ name: String, url: String }],
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('RFQ', rfqSchema);
