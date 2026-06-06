import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorbridge';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add dummy users based on specific requests
    const users = [
      {
        firstName: 'Kevin',
        lastName: 'Desai',
        username: 'kevindesai',
        email: 'kevin@vendorbridge.com',
        password: 'password123',
        role: 'Admin',
        isActive: true
      },
      {
        firstName: 'Harry',
        lastName: 'Mehta',
        username: 'harrymehta',
        email: 'harry@vendorbridge.com',
        password: 'password123',
        role: 'Manager',
        isActive: true
      },
      {
        firstName: 'Prathem',
        lastName: 'Mehta',
        username: 'prathemmehta',
        email: 'prathem@vendorbridge.com',
        password: 'password123',
        role: 'Officer',
        isActive: true
      },
      {
        firstName: 'Adu',
        lastName: 'Diwan',
        username: 'adudiwan',
        email: 'adu@example.com',
        password: 'password123',
        role: 'Vendor',
        isActive: true
      }
    ];

    for (let userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`User ${userData.username} created`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
