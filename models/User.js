const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    default: null
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  cart: [{
    itemId: String,
    itemName: String,
    quantity: Number,
    price: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  wishlist: [{
    itemId: String,
    itemName: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  registered: [{
    eventId: String,
    eventName: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   // Skip password hashing if password is empty (OAuth users)
//   if (!this.password || !this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   if (!this.password) {
//     return false;
//   }
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Custom validation for password (only required for non-OAuth users)
// userSchema.pre('validate', function(next) {
//   if (!this.isOAuthUser && !this.password) {
//     this.invalidate('password', 'Password is required for email/password signup');
//   }
//   next();
// });

// 1. Hash password before saving (Modern Async Style)
userSchema.pre('save', async function() {
  // If no password (OAuth) or not changed, just exit
  if (!this.password || !this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No next() needed here because of 'async'
  } catch (error) {
    throw error; 
  }
});

// 2. Custom validation (Synchronous Style)
userSchema.pre('validate', function() {
  if (!this.isOAuthUser && !this.password) {
    this.invalidate('password', 'Password is required for email/password signup');
  }
  // No next() needed here
});

// 3. Keep your comparePassword method as is
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model('User', userSchema);

