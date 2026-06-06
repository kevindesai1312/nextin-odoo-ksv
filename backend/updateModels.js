import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {
  'Role.js': `import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'Admin', 'Procurement Officer', 'Finance Manager', 'Vendor'
  description: String,
  permissions: { type: Map, of: Boolean, default: {} },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
`,
  'User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, default: 'Vendor' }, // Reference to Role name for simplicity
  phone: String,
  country: String,
  additionalInfo: String,
  avatarUrl: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
`,
  'VendorCategory.js': `import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

export default mongoose.model('VendorCategory', categorySchema);
`,
  'Vendor.js': `import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // Can be a reference to VendorCategory
  gstNo: { type: String, required: true },
  contactNo: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Blocked'], default: 'Pending' },
  email: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 0.0 },
  paymentTerms: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
`,
  'RFQ.js': `import mongoose from 'mongoose';

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
  deadline: { type: Date, required: true },
  description: String,
  status: { type: String, enum: ['Draft', 'Published', 'Closed', 'Cancelled'], default: 'Draft' },
  items: [rfqItemSchema],
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('RFQ', rfqSchema);
`,
  'Quotation.js': `import mongoose from 'mongoose';

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
`,
  'ApprovalWorkflow.js': `import mongoose from 'mongoose';

const approvalStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  stepLabel: { type: String, required: true },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverRole: String,
  status: { type: String, enum: ['Pending', 'Awaiting', 'Approved', 'Rejected'], default: 'Pending' },
  remarks: String,
  actionAt: Date,
  assignedAt: { type: Date, default: Date.now }
});

const approvalWorkflowSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  totalAmount: { type: Number, required: true },
  currentStep: { type: Number, default: 1 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  steps: [approvalStepSchema]
}, { timestamps: true });

export default mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
`,
  'PurchaseOrder.js': `import mongoose from 'mongoose';

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
`,
  'Invoice.js': `import mongoose from 'mongoose';

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
  status: { type: String, enum: ['Pending Payment', 'Paid', 'Overdue', 'Cancelled'], default: 'Pending Payment' },
  items: [invoiceItemSchema],
  paidAt: Date
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
`,
  'ActivityLog.js': `import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // 'RFQ', 'Approval', 'Vendor', 'Invoice', 'PO'
  action: { type: String, required: true },
  entityType: { type: String, required: true }, // 'rfqs', 'vendors', etc.
  entityId: { type: mongoose.Schema.Types.ObjectId },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, capped: false });

// Strictly INSERT-ONLY requirement
activityLogSchema.pre('updateOne', function(next) {
  next(new Error('Activity logs are immutable and cannot be updated'));
});
activityLogSchema.pre('deleteOne', function(next) {
  next(new Error('Activity logs are immutable and cannot be deleted'));
});
activityLogSchema.pre('findOneAndDelete', function(next) {
  next(new Error('Activity logs are immutable and cannot be deleted'));
});
activityLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Activity logs are immutable and cannot be updated'));
});

export default mongoose.model('ActivityLog', activityLogSchema);
`
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(__dirname, 'models', filename), content);
}

console.log('Mongoose models successfully updated to match Master Prompt!');
