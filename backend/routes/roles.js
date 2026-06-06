import express from 'express';
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
