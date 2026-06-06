import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all users
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Create a new user
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, isActive } = req.body;

    // Check duplicates
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }],
      deletedAt: null
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    const newUser = new User({
      username,
      email,
      password, // Pre-save hook will hash it
      firstName,
      lastName,
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    await newUser.save();
    
    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    
    res.status(201).json(userToReturn);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// Update a user
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, isActive } = req.body;
    
    // Check duplicates for other users
    const existingUser = await User.findOne({ 
      _id: { $ne: req.params.id },
      $or: [{ username }, { email }],
      deletedAt: null
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    
    const userToReturn = user.toObject();
    delete userToReturn.password;
    
    res.json(userToReturn);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Delete a user (Soft Delete)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'User successfully deleted.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

export default router;
