import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import RFQ from './models/RFQ.js';
import Quotation from './models/Quotation.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import ActivityLog from './models/ActivityLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorbridge';

const importData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany();
    await Vendor.deleteMany();
    await RFQ.deleteMany();
    await Quotation.deleteMany();
    await PurchaseOrder.deleteMany();
    await ActivityLog.deleteMany();

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@vendorbridge.com',
      password: 'admin123', // Will be hashed by pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'Admin'
    });

    // Vendors
    const vendorData = [
      { name: 'Infra Supplies Pvt Ltd', category: 'Construction', gstNo: '27AABCU9603R1Z0', contactNo: '9876543210', status: 'Active', email: 'contact@infrasupplies.com', address: '456, Industrial Estate, Surat' },
      { name: 'TechCore LTD', category: 'IT', gstNo: '27AABCU9603R1Z1', contactNo: '9876543211', status: 'Active', email: 'info@techcore.com', address: '789, Tech Park, Bangalore' },
      { name: 'FastLog Transport', category: 'Logistics', gstNo: '27AABCU9603R1Z2', contactNo: '9876543212', status: 'Blocked', email: 'support@fastlog.com', address: '321, Transport Nagar, Delhi' },
      { name: 'Office Wood Co.', category: 'Furniture', gstNo: '27AABCU9603R1Z3', contactNo: '9876543213', status: 'Active', email: 'sales@officewood.com', address: '654, Furniture Market, Mumbai' },
      { name: 'Stationery Plus', category: 'Stationery', gstNo: '27AABCU9603R1Z4', contactNo: '9876543214', status: 'Pending', email: 'hello@stationeryplus.com', address: '987, Paper Market, Chennai' }
    ];
    const vendors = await Vendor.insertMany(vendorData);

    // RFQs
    const rfqData = [
      {
        title: 'Office Furniture procurement Q2',
        category: 'Furniture',
        deadline: '15 June 2025',
        description: 'Ergonomic chairs and standing desks for 3rd floor',
        status: 'Sent',
        items: [
          { name: 'Ergonomic chair', qty: 25, unit: 'NOS' },
          { name: 'Standing desks', qty: 10, unit: 'NOS' }
        ],
        assignedVendors: [vendors[0]._id, vendors[1]._id, vendors[3]._id]
      },
      {
        title: 'IT Hardware Refresh Q2',
        category: 'IT Hardware',
        deadline: '30 June 2025',
        description: 'Laptops and monitors for new hires',
        status: 'Draft',
        items: [
          { name: 'Laptop Dell Latitude', qty: 15, unit: 'NOS' },
          { name: 'Monitor 27" LG', qty: 15, unit: 'NOS' }
        ],
        assignedVendors: [vendors[1]._id]
      }
    ];
    const rfqs = await RFQ.insertMany(rfqData);

    // Quotations
    const quotationData = [
      {
        rfqId: rfqs[0]._id,
        vendorId: vendors[0]._id,
        vendorName: vendors[0].name,
        items: [
          { name: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500, deliveryDays: 7 },
          { name: 'Standing desks', qty: 10, unitPrice: 9200, total: 92000, deliveryDays: 14 }
        ],
        taxPercent: 18,
        subtotal: 169500,
        taxAmount: 30510,
        grandTotal: 185000,
        deliveryDays: 10,
        paymentTerms: '30 days',
        notes: 'Payment terms: 30 days net from delivery',
        status: 'Submitted',
        vendorRating: 4.5
      },
      {
        rfqId: rfqs[0]._id,
        vendorId: vendors[1]._id,
        vendorName: vendors[1].name,
        items: [
          { name: 'Ergonomic chair', qty: 25, unitPrice: 3800, total: 95000, deliveryDays: 10 },
          { name: 'Standing desks', qty: 10, unitPrice: 9500, total: 95000, deliveryDays: 12 }
        ],
        taxPercent: 18,
        subtotal: 190000,
        taxAmount: 34200,
        grandTotal: 200010,
        deliveryDays: 14,
        paymentTerms: '20 days',
        notes: 'Payment terms: 20 days net from delivery',
        status: 'Submitted',
        vendorRating: 4.0
      }
    ];
    await Quotation.insertMany(quotationData);

    // Purchase Orders
    const poData = [
      {
        poNumber: 'PO-2025-0068',
        vendorName: vendors[0].name,
        vendorAddress: vendors[0].address,
        vendorGstin: vendors[0].gstNo,
        items: [
          { name: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500 },
          { name: 'Standing desks', qty: 10, unitPrice: 9200, total: 92000 }
        ],
        subtotal: 169500,
        cgst: 15255,
        sgst: 15255,
        grandTotal: 200010,
        status: 'Pending Payment',
        poDate: '21 May, 2025',
        invoiceDate: '22 May 2025',
        dueDate: '21 June 2025'
      }
    ];
    await PurchaseOrder.insertMany(poData);

    // Activity Logs
    const activityLogData = [
      { type: 'quotation', description: 'Quotation selected — Infra Supplies Pvt Ltd selected for office furniture Q2', timestamp: '23 May 2025, 4:15 PM', icon: 'check' },
      { type: 'approval', description: 'Approval pending — PO: 2024 awaiting L2 approval by Priya Shah', timestamp: '22 May 2025, 04:15 AM', icon: 'clock' },
      { type: 'rfq', description: 'RFQ published — office furniture Q2 sent to 3 vendors', timestamp: '19 May 2025', icon: 'file' },
      { type: 'vendor', description: 'Vendor added — FastLog transport registered and pending verifications', timestamp: '18 May 2025, 3:20 PM', icon: 'user' },
      { type: 'invoice', description: 'Invoice generated — PO-2025-0068 invoice created for Infra Supplies', timestamp: '17 May 2025, 2:00 PM', icon: 'file-text' }
    ];
    await ActivityLog.insertMany(activityLogData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

importData();
