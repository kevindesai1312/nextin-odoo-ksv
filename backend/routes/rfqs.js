import express from 'express';
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
