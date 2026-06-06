import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unitPrice: Number,
  totalPrice: Number
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorGstin: String,
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  subtotal: { type: Number, required: true },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Generated', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Pending Payment'], default: 'Draft' },
  items: [invoiceItemSchema],
  paymentTerms: String,
  paidAt: Date
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
