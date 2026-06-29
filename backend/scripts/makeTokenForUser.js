import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/buildestate';

const run = async (email) => {
  try {
    await mongoose.connect(MONGO, { dbName: 'buildestate' });
    const user = await userModel.findOne({ email }).lean();
    if (!user) {
      console.error('User not found for', email);
      process.exit(1);
    }

    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '30d' });

    console.log('TOKEN:', token);
    console.log('USER:', JSON.stringify({ _id: user._id, name: user.name, email: user.email, role: user.role }));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error generating token', err);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/makeTokenForUser.js <email>');
  process.exit(1);
}

run(email);
