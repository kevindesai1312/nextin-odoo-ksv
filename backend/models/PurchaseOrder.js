import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unitPrice: Number,
  totalPrice: Number
});

const poSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalWorkflow' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName: String,
  buyerOrgName: { type: String, required: true },
  buyerAddress: String,
  buyerGstin: String,
  items: [poItemSchema],
  subtotal: { type: Number, required: true },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled', 'Pending Payment', 'Paid'], default: 'Active' },
  poDate: { type: Date, required: true },
  invoiceDate: Date,
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('PurchaseOrder', poSchema);
