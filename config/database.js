const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rabuste', {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Continuing without database connection...');
    // Don't exit, continue without database
  }
};

module.exports = connectDB;

