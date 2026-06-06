import mongoose from 'mongoose';

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
