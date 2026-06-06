import express from 'express';
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
