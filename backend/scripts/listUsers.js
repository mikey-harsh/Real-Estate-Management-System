import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/estate-management';

const run = async () => {
  try {
    await mongoose.connect(MONGO, { dbName: 'estate-management' });
    console.log('Connected to MongoDB');

    const users = await userModel.find({}, { name: 1, email: 1, role: 1 }).lean();
    if (!users.length) {
      console.log('No users found');
    } else {
      console.log('Users:');
      users.forEach(u => console.log(JSON.stringify(u)));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error querying users', err);
    process.exit(1);
  }
};

run();
