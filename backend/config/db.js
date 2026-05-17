const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('⚠️  MongoDB connection error:', error.message);
    console.error('💡 To fix: Install MongoDB locally or use MongoDB Atlas');
    console.error('   - Download: https://www.mongodb.com/try/download/community');
    console.error('   - Or update MONGO_URI in .env to use MongoDB Atlas');
    throw error;
  }
};

module.exports = connectDB;
