import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'Admin', 'Procurement Officer', 'Finance Manager', 'Vendor'
  description: String,
  permissions: { type: Map, of: Boolean, default: {} },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
