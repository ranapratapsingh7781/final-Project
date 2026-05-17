const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Fix: Drop old username index if it exists to prevent duplicate key errors
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'users' }).toArray();
      
      if (collections.length > 0) {
        // Drop the problematic unique index on username if it exists
        await db.collection('users').dropIndex('username_1').catch(() => {
          // Index doesn't exist, that's fine
        });
      }
    } catch (indexError) {
      // Silently handle index errors - collection might not exist yet
    }
    
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
