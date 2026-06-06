import express from 'express';
import Invoice from '../models/Invoice.js';
import Vendor from '../models/Vendor.js';
import nodemailer from 'nodemailer';
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


router.route('/:id/send')
  .post(protect, async (req, res) => {
    try {
       const invoice = await Invoice.findById(req.params.id);
       if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
       
       const vendor = await Vendor.findById(invoice.vendorId);
       const recipientEmail = vendor?.email || 'vendor@example.com';

       const { subject, message } = req.body;

       // Use Ethereal for testing
       let testAccount = await nodemailer.createTestAccount();
       let transporter = nodemailer.createTransport({
         host: "smtp.ethereal.email",
         port: 587,
         secure: false, 
         auth: {
           user: testAccount.user, 
           pass: testAccount.pass, 
         },
       });

       let info = await transporter.sendMail({
         from: '"VendorBridge Procurement" <no-reply@vendorbridge.com>',
         to: recipientEmail,
         subject: subject || `Invoice ${invoice.invoiceNumber}`,
         text: message || `Please find attached the invoice ${invoice.invoiceNumber}.`,
         // In a real app we would attach a generated PDF here from req.file or memory
       });

       invoice.status = 'Sent';
       await invoice.save();

       await logActivity(req, 'Invoice', `Emailed Invoice ${invoice.invoiceNumber}`, 'invoices', invoice._id);
       
       res.json({
         ...invoice.toObject(), id: invoice._id.toString(),
         previewUrl: nodemailer.getTestMessageUrl(info) // Send preview URL back to frontend!
       });
    } catch (error) {
       res.status(400).json({ message: error.message });
    }
  });

export default router;
