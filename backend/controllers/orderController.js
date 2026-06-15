const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', sortBy = 'orderDate', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) query.category = category;

    let orders = await Order.find(query)
      .populate('customerId', 'name email city')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Filter by search after populate
    if (search) {
      orders = orders.filter(o =>
        o.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.category?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const order = new Order(req.body);
    await order.save();

    // Update customer totalSpent and lastPurchaseDate
    customer.totalSpent = (customer.totalSpent || 0) + order.amount;
    customer.lastPurchaseDate = order.orderDate;
    await customer.save();

    const populated = await order.populate('customerId', 'name email');
    res.status(201).json({ success: true, data: populated, message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const amountDiff = (req.body.amount || oldOrder.amount) - oldOrder.amount;

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('customerId', 'name email');

    // Update customer totalSpent
    if (amountDiff !== 0) {
      await Customer.findByIdAndUpdate(oldOrder.customerId, {
        $inc: { totalSpent: amountDiff }
      });
    }

    res.json({ success: true, data: order, message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Update customer totalSpent
    await Customer.findByIdAndUpdate(order.customerId, {
      $inc: { totalSpent: -order.amount }
    });

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
