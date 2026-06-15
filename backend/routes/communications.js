const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');

router.get('/', async (req, res) => {
  try {
    const { campaignId } = req.query;
    const query = campaignId ? { campaignId } : {};
    const comms = await Communication.find(query)
      .populate('customerId', 'name email')
      .populate('campaignId', 'name')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, data: comms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
