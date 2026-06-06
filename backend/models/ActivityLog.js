import mongoose from 'mongoose';

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
