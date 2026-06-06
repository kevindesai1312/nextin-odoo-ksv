import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PurchaseOrder from './models/PurchaseOrder.js';
import Vendor from './models/Vendor.js';
import Invoice from './models/Invoice.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorbridge';

const seedDashboardData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Get or create some vendors with categories
    const vendors = await Vendor.find({});
    
    // Make sure vendors have categories
    const categories = ['IT Hardware', 'Office Supplies', 'Logistics', 'Services'];
    for (let i = 0; i < vendors.length; i++) {
      vendors[i].category = categories[i % categories.length];
      vendors[i].status = 'Active';
      await vendors[i].save();
    }

    if (vendors.length === 0) {
      console.log('No vendors found. Please run seedUsers first or add vendors.');
      process.exit(1);
    }

    // 2. Clear old POs and Invoices to prevent clutter
    await PurchaseOrder.deleteMany({});
    await Invoice.deleteMany({});

    // 3. Generate 6 months of PO data
    const pos = [];
    const invoices = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      // Create 3-5 POs per month
      const numPOs = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < numPOs; j++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, Math.floor(Math.random() * 28) + 1);
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const amount = Math.floor(Math.random() * 500000) + 100000; // 1L to 6L
        
        const po = new PurchaseOrder({
          poNumber: `PO-${date.getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          vendorId: vendor._id,
          vendorName: vendor.name,
          buyerOrgName: 'VendorBridge Corp',
          subtotal: amount * 0.9,
          grandTotal: amount,
          status: Math.random() > 0.2 ? 'Completed' : 'Active',
          poDate: date,
          createdAt: date
        });
        pos.push(po);

        // Create an invoice for this PO
        if (po.status === 'Completed') {
          const invoiceDate = new Date(date);
          invoiceDate.setDate(invoiceDate.getDate() + 5);
          const dueDate = new Date(invoiceDate);
          dueDate.setDate(dueDate.getDate() + 30);
          
          const isOverdue = dueDate < new Date() && Math.random() > 0.5;
          
          invoices.push(new Invoice({
            invoiceNumber: `INV-${date.getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            poId: po._id,
            vendorId: vendor._id,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            subtotal: amount * 0.9,
            grandTotal: amount,
            status: isOverdue ? 'Overdue' : 'Paid'
          }));
        }
      }
    }

    await PurchaseOrder.insertMany(pos);
    await Invoice.insertMany(invoices);

    console.log(`Successfully seeded ${pos.length} Purchase Orders and ${invoices.length} Invoices.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDashboardData();
