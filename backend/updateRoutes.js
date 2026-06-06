import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = {
  'middleware/activityLogger.js': `import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (req, eventType, action, entityType, entityId, metadata = {}) => {
  try {
    await ActivityLog.create({
      eventType,
      action,
      entityType,
      entityId,
      performedBy: req.user ? req.user._id : null,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
`,
  'routes/rfqs.js': `import express from 'express';
import RFQ from '../models/RFQ.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const rfqs = await RFQ.find({ deletedAt: null }).populate('assignedVendors');
      res.json(rfqs.map(r => ({...r.toObject(), id: r._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const rfq = await RFQ.create({ ...req.body, createdBy: req.user._id });
      await logActivity(req, 'RFQ', 'Created RFQ', 'rfqs', rfq._id, { rfqNumber: rfq.rfqNumber });
      res.status(201).json({...rfq.toObject(), id: rfq._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(protect, async (req, res) => {
    try {
      const rfq = await RFQ.findOne({ _id: req.params.id, deletedAt: null });
      if (rfq) res.json({...rfq.toObject(), id: rfq._id.toString()});
      else res.status(404).json({ message: 'RFQ not found' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const rfq = await RFQ.findOne({ _id: req.params.id, deletedAt: null });
      if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
      
      // Rule 03: Only creating Officer or Admin can edit, solely in Draft status
      if (req.user.role !== 'Admin' && rfq.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this RFQ' });
      }
      if (rfq.status !== 'Draft' && req.body.status !== 'Published' && req.body.status !== 'Cancelled') {
        return res.status(400).json({ message: 'Can only edit RFQs in Draft status' });
      }

      Object.assign(rfq, req.body);
      await rfq.save();
      await logActivity(req, 'RFQ', 'Updated RFQ', 'rfqs', rfq._id, { status: rfq.status });
      res.json({...rfq.toObject(), id: rfq._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const rfq = await RFQ.findById(req.params.id);
      if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
      rfq.deletedAt = new Date();
      await rfq.save();
      await logActivity(req, 'RFQ', 'Deleted RFQ', 'rfqs', rfq._id);
      res.json({ message: 'RFQ deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
`,
  'routes/quotations.js': `import express from 'express';
import Quotation from '../models/Quotation.js';
import RFQ from '../models/RFQ.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const quotations = await Quotation.find({ deletedAt: null });
      res.json(quotations.map(q => ({...q.toObject(), id: q._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      // Rule 01: Quotation submission logic
      const rfq = await RFQ.findById(req.body.rfqId);
      if (!rfq) return res.status(404).json({ message: 'Parent RFQ not found' });
      
      if (rfq.status !== 'Published') {
        return res.status(400).json({ message: 'RFQ is not published' });
      }
      if (new Date() > new Date(rfq.deadline)) {
        return res.status(400).json({ message: 'RFQ deadline has passed' });
      }

      const quotation = await Quotation.create({ ...req.body, submittedBy: req.user._id, submittedAt: new Date() });
      await logActivity(req, 'Quotation', 'Submitted Quotation', 'quotations', quotation._id, { rfqId: rfq._id });
      res.status(201).json({...quotation.toObject(), id: quotation._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
`,
  'routes/purchaseOrders.js': `import express from 'express';
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
`
};

for (const [filepath, content] of Object.entries(routes)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log('Routes successfully updated to enforce Business Rules!');
