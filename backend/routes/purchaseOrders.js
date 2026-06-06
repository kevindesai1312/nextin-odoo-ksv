import express from 'express';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Quotation from '../models/Quotation.js';
import ApprovalWorkflow from '../models/ApprovalWorkflow.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const pos = await PurchaseOrder.find({ deletedAt: null });
      res.json(pos.map(p => ({...p.toObject(), id: p._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      // Rule 02: PO Generation logic
      if (req.body.quotationId) {
        const quotation = await Quotation.findById(req.body.quotationId);
        if (!quotation || quotation.status !== 'Selected') {
          return res.status(400).json({ message: 'Quotation must be Selected to generate a PO' });
        }
      }

      if (req.body.workflowId) {
        const workflow = await ApprovalWorkflow.findById(req.body.workflowId);
        if (!workflow || workflow.status !== 'Approved') {
           return res.status(400).json({ message: 'Approval workflow must be completed' });
        }
      }

      const po = await PurchaseOrder.create({ ...req.body, createdBy: req.user._id });
      await logActivity(req, 'PO', 'Generated Purchase Order', 'purchaseorders', po._id, { poNumber: po.poNumber });
      res.status(201).json({...po.toObject(), id: po._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
