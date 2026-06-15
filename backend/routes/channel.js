const express = require('express');
const router = express.Router();
const channelService = require('../services/channelService');

// Simulate sending a campaign externally
router.post('/send-campaign', async (req, res) => {
  try {
    const { campaignId, recipients } = req.body;
    if (!campaignId) return res.status(400).json({ success: false, message: 'campaignId required' });
    channelService.simulateDelivery(campaignId, recipients || 10);
    res.json({ success: true, message: 'Campaign dispatch initiated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delivery receipt callback
router.post('/receipt', channelService.processReceipt);

module.exports = router;
