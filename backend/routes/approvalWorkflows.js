import express from 'express';
import ApprovalWorkflow from '../models/ApprovalWorkflow.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Quotation from '../models/Quotation.js';
import Vendor from '../models/Vendor.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const workflows = await ApprovalWorkflow.find({});
      res.json(workflows.map(w => ({...w.toObject(), id: w._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const workflow = await ApprovalWorkflow.create({ ...req.body, initiatedBy: req.user._id });
      await logActivity(req, 'Approval', 'Initiated Approval Workflow', 'approvalworkflows', workflow._id);
      res.status(201).json({...workflow.toObject(), id: workflow._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/:id/steps/:stepNumber')
  .put(protect, async (req, res) => {
    try {
      const workflow = await ApprovalWorkflow.findById(req.params.id);
      if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

      const stepIndex = workflow.steps.findIndex(s => s.stepNumber === parseInt(req.params.stepNumber));
      if (stepIndex === -1) return res.status(404).json({ message: 'Step not found' });

      workflow.steps[stepIndex].status = req.body.status;
      workflow.steps[stepIndex].remarks = req.body.remarks;
      workflow.steps[stepIndex].actionAt = new Date();
      workflow.steps[stepIndex].approverId = req.user._id;

      // Update current step
      if (req.body.status === 'Approved') {
         workflow.currentStep += 1;
         if (workflow.currentStep > workflow.steps.length) {
            workflow.status = 'Approved';
            
            // Auto-generate PO
            try {
              const quote = await Quotation.findById(workflow.quotationId);
              const vendor = await Vendor.findById(workflow.vendorId);
              
              if (quote && vendor) {
                const poCount = await PurchaseOrder.countDocuments();
                const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;
                
                const newPo = await PurchaseOrder.create({
                  poNumber,
                  workflowId: workflow._id,
                  quotationId: quote._id,
                  vendorId: vendor._id,
                  vendorName: vendor.companyName,
                  buyerOrgName: 'VendorBridge Enterprise',
                  buyerAddress: '123 Procurement St, Tech Park, City',
                  items: quote.items.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
                  subtotal: quote.subtotal,
                  cgstAmount: quote.gstAmount ? quote.gstAmount / 2 : 0,
                  sgstAmount: quote.gstAmount ? quote.gstAmount / 2 : 0,
                  grandTotal: quote.grandTotal,
                  status: 'Draft',
                  poDate: new Date(),
                  createdBy: req.user._id
                });
                
                quote.status = 'Selected';
                await quote.save();
                
                await logActivity(req, 'Purchase Order', `Auto-generated PO ${poNumber}`, 'purchaseorders', newPo._id);
              }
            } catch (e) {
              console.error('Failed to auto-generate PO:', e);
            }
         }
      } else if (req.body.status === 'Rejected') {
         workflow.status = 'Rejected';
      } else if (req.body.status === 'Changes Requested') {
         // Keep workflow pending, maybe revert step
      }

      await workflow.save();
      await logActivity(req, 'Approval', `Workflow Step ${req.params.stepNumber} ${req.body.status}`, 'approvalworkflows', workflow._id, { status: req.body.status });
      
      res.json({...workflow.toObject(), id: workflow._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
