import express from 'express';
import Invoice from '../models/Invoice.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const invoices = await Invoice.find({});
      res.json(invoices.map(i => ({...i.toObject(), id: i._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const invoice = await Invoice.create(req.body);
      await logActivity(req, 'Invoice', 'Generated Invoice', 'invoices', invoice._id, { invoiceNumber: invoice.invoiceNumber });
      res.status(201).json({...invoice.toObject(), id: invoice._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/:id/pay')
  .post(protect, async (req, res) => {
    try {
       const invoice = await Invoice.findById(req.params.id);
       if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

       invoice.status = 'Paid';
       invoice.paidAt = new Date();
       await invoice.save();

       await logActivity(req, 'Invoice', 'Paid Invoice', 'invoices', invoice._id);
       res.json({...invoice.toObject(), id: invoice._id.toString()});
    } catch (error) {
       res.status(400).json({ message: error.message });
    }
  });

export default router;
