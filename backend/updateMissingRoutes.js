import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = {
  'routes/roles.js': `import express from 'express';
import Role from '../models/Role.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const roles = await Role.find({ deletedAt: null });
      res.json(roles.map(r => ({...r.toObject(), id: r._id.toString()})));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
`,
  'routes/approvalWorkflows.js': `import express from 'express';
import ApprovalWorkflow from '../models/ApprovalWorkflow.js';
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
         }
      } else if (req.body.status === 'Rejected') {
         workflow.status = 'Rejected';
      }

      await workflow.save();
      await logActivity(req, 'Approval', \`Workflow Step \${req.params.stepNumber} \${req.body.status}\`, 'approvalworkflows', workflow._id, { status: req.body.status });
      
      res.json({...workflow.toObject(), id: workflow._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
`,
  'routes/invoices.js': `import express from 'express';
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
`
};

for (const [filepath, content] of Object.entries(routes)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

// Modify server.js to include the new routes
const serverJsPath = path.join(__dirname, 'server.js');
let serverJs = fs.readFileSync(serverJsPath, 'utf-8');

if (!serverJs.includes('routes/roles.js')) {
  serverJs = serverJs.replace(
    "import activityRoutes from './routes/activity.js';",
    "import activityRoutes from './routes/activity.js';\nimport roleRoutes from './routes/roles.js';\nimport approvalRoutes from './routes/approvalWorkflows.js';\nimport invoiceRoutes from './routes/invoices.js';"
  );
  
  serverJs = serverJs.replace(
    "app.use('/api/activity', activityRoutes);",
    "app.use('/api/activity', activityRoutes);\napp.use('/api/roles', roleRoutes);\napp.use('/api/approvals', approvalRoutes);\napp.use('/api/invoices', invoiceRoutes);"
  );
  
  fs.writeFileSync(serverJsPath, serverJs);
}

console.log('Missing routes successfully generated and attached to server.js!');
