import mongoose from 'mongoose';

const approvalStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  stepLabel: { type: String, required: true },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverRole: String,
  status: { type: String, enum: ['Pending', 'Awaiting', 'Approved', 'Rejected', 'Changes Requested'], default: 'Pending' },
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
