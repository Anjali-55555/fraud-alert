const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryConnStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fraudalert_lite';
  const fallbackConnStr = 'mongodb://127.0.0.1:27017/fraudalert_lite';

  try {
    console.log(`[Database] Attempting connection to MongoDB Atlas...`);
    await mongoose.connect(primaryConnStr, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Database] Connected successfully to Primary DB: ${primaryConnStr.split('@')[1] || primaryConnStr}`);
  } catch (error) {
    console.warn(`[Database] Primary MongoDB connection failed: ${error.message}`);
    console.log(`[Database] Switching to Local Fallback Database...`);
    try {
      await mongoose.connect(fallbackConnStr);
      console.log(`[Database] Connected successfully to Fallback DB: ${fallbackConnStr}`);
    } catch (fallbackError) {
      console.error(`[Database] Fatal: Fallback MongoDB connection failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
