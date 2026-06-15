const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Shoes', 'Socks', 'Clothing', 'Electronics', 'Accessories', 'Sports', 'Home', 'Books', 'Beauty', 'Other'],
      default: 'Other'
    },
    orderDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ category: 1 });

module.exports = mongoose.model('Order', orderSchema);
