import express from 'express';
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

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const quotation = await Quotation.findById(req.params.id);
      if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
      
      const rfq = await RFQ.findById(quotation.rfqId);
      if (!rfq) return res.status(404).json({ message: 'Parent RFQ not found' });
      
      if (new Date() > new Date(rfq.deadline)) {
        return res.status(400).json({ message: 'RFQ deadline has passed, cannot update quote' });
      }

      if (quotation.status === 'Selected' || quotation.status === 'Rejected') {
        return res.status(400).json({ message: 'Quotation is already processed' });
      }

      const updated = await Quotation.findByIdAndUpdate(req.params.id, { ...req.body, submittedAt: new Date() }, { new: true });
      await logActivity(req, 'Quotation', 'Updated Quotation', 'quotations', updated._id, { rfqId: rfq._id });
      res.json({...updated.toObject(), id: updated._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
