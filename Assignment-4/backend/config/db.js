const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_connect');
    console.log(`[database] Connected to MongoDB successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
