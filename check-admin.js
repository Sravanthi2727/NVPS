const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rabuste')
  .then(async () => {
    console.log('Checking admin users...');
    const admins = await User.find({ role: 'admin' });
    console.log('Found admins:', admins.length);
    admins.forEach(admin => {
      console.log('Admin:', { email: admin.email, role: admin.role, status: admin.status });
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
