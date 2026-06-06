import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ['models', 'routes', 'middleware'];
dirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    fs.mkdirSync(path.join(__dirname, dir));
  }
});

const models = {
  'User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, default: 'Vendor' },
  phone: String,
  country: String,
  additionalInfo: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
`,
  'Vendor.js': `import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  gstNo: { type: String, required: true },
  contactNo: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Pending', 'Blocked'], default: 'Pending' },
  email: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
`,
  'RFQ.js': `import mongoose from 'mongoose';

const rfqItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unit: String
});

const rfqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  deadline: String,
  description: String,
  status: { type: String, enum: ['Draft', 'Sent', 'Closed'], default: 'Draft' },
  items: [rfqItemSchema],
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }]
}, { timestamps: true });

export default mongoose.model('RFQ', rfqSchema);
`,
  'Quotation.js': `import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unitPrice: Number,
  total: Number,
  deliveryDays: Number
});

const quotationSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName: String,
  items: [quotationItemSchema],
  taxPercent: Number,
  subtotal: Number,
  taxAmount: Number,
  grandTotal: Number,
  deliveryDays: Number,
  paymentTerms: String,
  notes: String,
  status: { type: String, enum: ['Draft', 'Submitted'], default: 'Submitted' },
  vendorRating: Number
}, { timestamps: true });

export default mongoose.model('Quotation', quotationSchema);
`,
  'PurchaseOrder.js': `import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unitPrice: Number,
  total: Number
});

const poSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  vendorName: String,
  vendorAddress: String,
  vendorGstin: String,
  items: [poItemSchema],
  subtotal: Number,
  cgst: Number,
  sgst: Number,
  grandTotal: Number,
  status: { type: String, enum: ['Pending Payment', 'Paid'], default: 'Pending Payment' },
  poDate: String,
  invoiceDate: String,
  dueDate: String
}, { timestamps: true });

export default mongoose.model('PurchaseOrder', poSchema);
`,
  'ActivityLog.js': `import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: String, required: true },
  icon: String
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
`
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(__dirname, 'models', filename), content);
}

const middleware = {
  'auth.js': `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
`
};

for (const [filename, content] of Object.entries(middleware)) {
  fs.writeFileSync(path.join(__dirname, 'middleware', filename), content);
}

const routes = {
  'auth.js': `import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, phone, country, additionalInfo } = req.body;
    
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username, email, password, firstName, lastName, role, phone, country, additionalInfo
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
`,
  'vendors.js': `import express from 'express';
import Vendor from '../models/Vendor.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const vendors = await Vendor.find({});
      // map to match frontend interface: id -> _id
      res.json(vendors.map(v => ({...v.toObject(), id: v._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const vendor = await Vendor.create(req.body);
      res.status(201).json({...vendor.toObject(), id: vendor._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(protect, async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (vendor) res.json({...vendor.toObject(), id: vendor._id.toString()});
      else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (vendor) res.json({...vendor.toObject(), id: vendor._id.toString()});
      else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const vendor = await Vendor.findByIdAndDelete(req.params.id);
      if (vendor) res.json({ message: 'Vendor removed' });
      else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
`,
  'rfqs.js': `import express from 'express';
import RFQ from '../models/RFQ.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const rfqs = await RFQ.find({}).populate('assignedVendors');
      res.json(rfqs.map(r => ({...r.toObject(), id: r._id.toString(), assignedVendors: r.assignedVendors.map(v => v._id.toString())})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const rfq = await RFQ.create(req.body);
      res.status(201).json({...rfq.toObject(), id: rfq._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(protect, async (req, res) => {
    try {
      const rfq = await RFQ.findById(req.params.id);
      if (rfq) res.json({...rfq.toObject(), id: rfq._id.toString()});
      else res.status(404).json({ message: 'RFQ not found' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (rfq) res.json({...rfq.toObject(), id: rfq._id.toString()});
      else res.status(404).json({ message: 'RFQ not found' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
`,
  'quotations.js': `import express from 'express';
import Quotation from '../models/Quotation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const quotations = await Quotation.find({});
      res.json(quotations.map(q => ({...q.toObject(), id: q._id.toString(), rfqId: q.rfqId?.toString(), vendorId: q.vendorId?.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const quotation = await Quotation.create(req.body);
      res.status(201).json({...quotation.toObject(), id: quotation._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
`,
  'purchaseOrders.js': `import express from 'express';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const pos = await PurchaseOrder.find({});
      res.json(pos.map(p => ({...p.toObject(), id: p._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const po = await PurchaseOrder.create(req.body);
      res.status(201).json({...po.toObject(), id: po._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
`,
  'activity.js': `import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const logs = await ActivityLog.find({}).sort({ createdAt: -1 });
      res.json(logs.map(l => ({...l.toObject(), id: l._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
`,
  'dashboard.js': `import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, (req, res) => {
  // Mock aggregated stats for now. In real app, calculate from DB
  res.json({
    categorySpend: [
      { category: 'IT Hardware', amount: 4.8, color: '#0D9488' },
      { category: 'Furniture', amount: 3.2, color: '#10B981' },
      { category: 'Stationery', amount: 2.1, color: '#F59E0B' },
      { category: 'Logistics', amount: 2.3, color: '#F97316' }
    ],
    topVendors: [
      { name: 'TechCore Ltd', spend: 420000, pos: 6 },
      { name: 'Infra Supplies', spend: 310000, pos: 4 },
      { name: 'FastLog', spend: 190000, pos: 3 }
    ],
    monthlyTrend: [
      { month: 'Dec', spend: 6.2 },
      { month: 'Jan', spend: 7.8 },
      { month: 'Feb', spend: 8.5 },
      { month: 'Mar', spend: 10.2 },
      { month: 'Apr', spend: 11.5 },
      { month: 'May', spend: 12.4 }
    ],
    approvalSteps: [
      { step: 1, label: 'L1', status: 'completed', approver: 'Rahul Mehta', role: 'Procurement Head', date: 'May 20, 10:32 AM', remarks: 'Approved' },
      { step: 2, label: 'L1 Review', status: 'completed', approver: 'Rahul Mehta', role: 'Procurement Head', date: 'May 20, 11:00 AM', remarks: 'Reviewed and approved' },
      { step: 3, label: 'L2 Approval', status: 'current', approver: 'Priya Shah', role: 'Finance Manager', date: 'May 21', remarks: '' },
      { step: 4, label: 'Generate PO', status: 'pending' }
    ]
  });
});

export default router;
`
};

for (const [filename, content] of Object.entries(routes)) {
  fs.writeFileSync(path.join(__dirname, 'routes', filename), content);
}

console.log('Backend files generated successfully!');
