const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPurchaseDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastPurchaseDate: -1 });

module.exports = mongoose.model('Customer', customerSchema);
