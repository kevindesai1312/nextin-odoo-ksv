import express from 'express';
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
