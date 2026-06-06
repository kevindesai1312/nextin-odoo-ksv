import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  rfqLineId: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryDays: Number
});

const quotationSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [quotationItemSchema],
  attachments: [{ name: String, url: String }],
  status: { type: String, enum: ['Draft', 'Submitted', 'Selected', 'Rejected'], default: 'Draft' },
  taxGstPercent: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  deliveryDays: Number,
  paymentTerms: String,
  notes: String,
  vendorRating: Number,
  submittedAt: Date,
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

export default mongoose.model('Quotation', quotationSchema);
