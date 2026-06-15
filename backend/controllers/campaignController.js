const Campaign = require('../models/Campaign');
const Communication = require('../models/Communication');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');
const channelService = require('../services/channelService');

exports.getCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const [campaigns, total] = await Promise.all([
      Campaign.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
      Campaign.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: campaigns,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json({ success: true, data: campaign, message: 'Campaign created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign, message: 'Campaign updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    await Communication.deleteMany({ campaignId: req.params.id });
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.status === 'Active' || campaign.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Campaign already sent' });
    }

    // Get customers for this campaign audience
    let customers = await Customer.find().limit(campaign.audienceSize || 50);
    if (customers.length === 0) customers = await Customer.find().limit(20);

    // Create communication records
    const communications = customers.map(c => ({
      campaignId: campaign._id,
      customerId: c._id,
      status: 'Sent',
      statusHistory: [{ status: 'Sent', timestamp: new Date() }],
      timestamp: new Date()
    }));

    await Communication.insertMany(communications);

    // Update campaign status and stats
    campaign.status = 'Active';
    campaign.sentAt = new Date();
    campaign.stats.sent = customers.length;
    await campaign.save();

    // Trigger channel service simulation asynchronously
    channelService.simulateDelivery(campaign._id.toString(), communications.length);

    res.json({
      success: true,
      message: `Campaign sent to ${customers.length} customers`,
      data: campaign
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const communications = await Communication.find({ campaignId: req.params.id }).populate('customerId', 'name email');

    const statusCounts = communications.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const total = communications.length;
    const delivered = statusCounts['Delivered'] || 0;
    const opened = statusCounts['Opened'] || 0;
    const clicked = statusCounts['Clicked'] || 0;
    const failed = statusCounts['Failed'] || 0;

    res.json({
      success: true,
      data: {
        campaign,
        communications,
        stats: {
          total,
          sent: statusCounts['Sent'] || 0,
          delivered,
          opened,
          clicked,
          failed,
          deliveryRate: total ? ((delivered + opened + clicked) / total * 100).toFixed(1) : 0,
          openRate: total ? (opened / total * 100).toFixed(1) : 0,
          clickRate: total ? (clicked / total * 100).toFixed(1) : 0
        },
        funnel: [
          { stage: 'Sent', count: total },
          { stage: 'Delivered', count: delivered + opened + clicked },
          { stage: 'Opened', count: opened + clicked },
          { stage: 'Clicked', count: clicked }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
