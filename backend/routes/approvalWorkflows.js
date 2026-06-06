import express from 'express';
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
      await logActivity(req, 'Approval', `Workflow Step ${req.params.stepNumber} ${req.body.status}`, 'approvalworkflows', workflow._id, { status: req.body.status });
      
      res.json({...workflow.toObject(), id: workflow._id.toString()});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
