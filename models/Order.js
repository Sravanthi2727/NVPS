const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  type: {
    type: String,
    enum: ['menu', 'art'],
    default: 'menu'
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'cod'],
    default: 'online'
  },
  paymentId: {
    type: String,
    default: ''
  },
  deliveryAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  orderType: {
    type: String,
    enum: ['menu', 'art', 'mixed'],
    default: 'menu'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);