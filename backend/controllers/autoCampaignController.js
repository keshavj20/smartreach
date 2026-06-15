const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const Communication = require('../models/Communication');
const geminiService = require('../services/geminiService');
const emailService = require('../services/emailService');

// Audience rule functions
async function getSegmentCustomers(segmentKey) {
  switch (segmentKey) {
    case 'high_value_inactive': {
      const ago = new Date(Date.now() - 30 * 86400000);
      return Customer.find({ totalSpent: { $gt: 5000 }, $or: [{ lastPurchaseDate: { $lt: ago } }, { lastPurchaseDate: null }] });
    }
    case 'frequent_buyers': {
      const counts = await Order.aggregate([{ $group: { _id: '$customerId', c: { $sum: 1 } } }, { $match: { c: { $gt: 5 } } }]);
      return Customer.find({ _id: { $in: counts.map(x => x._id) } });
    }
    case 'new_customers': {
      const counts = await Order.aggregate([{ $group: { _id: '$customerId', c: { $sum: 1 } } }, { $match: { c: 1 } }]);
      return Customer.find({ _id: { $in: counts.map(x => x._id) } });
    }
    case 'cross_sell': {
      const shoes = await Order.distinct('customerId', { category: 'Shoes' });
      const socks = new Set((await Order.distinct('customerId', { category: 'Socks' })).map(String));
      return Customer.find({ _id: { $in: shoes.filter(id => !socks.has(String(id))) } });
    }
    case 'churn_risk': {
      const ago = new Date(Date.now() - 45 * 86400000);
      return Customer.find({ $or: [{ lastPurchaseDate: { $lt: ago } }, { lastPurchaseDate: null }] });
    }
    case 'all':
    default:
      return Customer.find().limit(50);
  }
}

const SEGMENT_TITLES = {
  high_value_inactive: 'High Value Inactive Customers',
  frequent_buyers: 'Frequent Buyers',
  new_customers: 'New Customers',
  cross_sell: 'Cross-Sell Opportunities',
  churn_risk: 'Churn Risk Customers',
  all: 'All Customers'
};

/**
 * POST /api/auto-campaign/generate
 * Reads customer data → calls Gemini → creates campaign → saves communications → optionally sends emails
 */
exports.generateAndSend = async (req, res) => {
  const { segmentKey = 'all', campaignName, sendRealEmail = false, maxCustomers = 20 } = req.body;

  try {
    const segmentTitle = SEGMENT_TITLES[segmentKey] || 'Custom Segment';
    const customers = await getSegmentCustomers(segmentKey);

    if (customers.length === 0) {
      return res.status(400).json({ success: false, message: 'No customers found for this segment.' });
    }

    const limited = customers.slice(0, Math.min(maxCustomers, 50));

    // Create the parent campaign record
    const campaign = await Campaign.create({
      name: campaignName || `AI Auto-Campaign — ${segmentTitle}`,
      audienceName: segmentTitle,
      audienceSize: limited.length,
      channel: sendRealEmail ? 'Email' : 'Email (Simulated)',
      message: `AI-generated personalized offers for ${segmentTitle}`,
      status: 'Active',
      sentAt: new Date(),
      audienceRuleKey: segmentKey
    });

    // Stream progress back via SSE not viable in standard REST — use async processing
    // Process each customer: generate offer → log communication → send email
    const results = [];
    let delivered = 0, failed = 0, simulated = 0;

    for (const customer of limited) {
      try {
        // 1. Fetch customer's order history
        const orders = await Order.find({ customerId: customer._id }).sort({ orderDate: -1 }).limit(20);

        // 2. Call Gemini to generate personalized offer
        const offer = await geminiService.generatePersonalizedOffer({ customer, orders, segmentTitle });

        // 3. Determine email delivery result
        let emailResult = { sent: false, simulated: true };
        if (sendRealEmail && customer.email) {
          emailResult = await emailService.sendEmail({
            to: customer.email,
            toName: customer.name,
            subject: offer.subject,
            htmlBody: offer.htmlBody,
            textBody: offer.offerMessage
          });
        }

        // 4. Determine final status
        let status;
        if (emailResult.sent) { status = 'Delivered'; delivered++; }
        else if (emailResult.simulated) { status = 'Delivered'; simulated++; }
        else { status = 'Failed'; failed++; }

        // 5. Save communication record with offer details
        const comm = await Communication.create({
          campaignId: campaign._id,
          customerId: customer._id,
          status,
          statusHistory: [
            { status: 'Sent', timestamp: new Date() },
            { status, timestamp: new Date(Date.now() + 2000) }
          ],
          timestamp: new Date(),
          offerCode: offer.offerCode,
          offerSubject: offer.subject,
          offerMessage: offer.offerMessage,
          discountPercent: offer.discountPercent,
          emailSent: emailResult.sent,
          emailSimulated: emailResult.simulated || false
        });

        results.push({
          customerId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          offerCode: offer.offerCode,
          discountPercent: offer.discountPercent,
          subject: offer.subject,
          message: offer.offerMessage,
          status,
          emailSent: emailResult.sent,
          emailSimulated: emailResult.simulated || false
        });

      } catch (customerErr) {
        console.error(`Failed for customer ${customer._id}:`, customerErr.message);
        failed++;
        results.push({
          customerId: customer._id,
          customerName: customer.name,
          status: 'Failed',
          error: customerErr.message
        });
      }

      // Small delay to avoid Gemini rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    // Update campaign stats
    await Campaign.findByIdAndUpdate(campaign._id, {
      status: 'Completed',
      'stats.sent': limited.length,
      'stats.delivered': delivered + simulated,
      'stats.failed': failed
    });

    res.json({
      success: true,
      message: `AI campaign generated and sent to ${limited.length} customers`,
      data: {
        campaign: { _id: campaign._id, name: campaign.name, status: 'Completed' },
        summary: {
          total: limited.length,
          delivered: delivered + simulated,
          realEmailsSent: delivered,
          simulated,
          failed,
          segmentTitle
        },
        results
      }
    });

  } catch (err) {
    console.error('AutoCampaign error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auto-campaign/preview
 * Preview what AI would generate for a single customer WITHOUT saving anything
 */
exports.previewOffer = async (req, res) => {
  const { customerId, segmentKey = 'all' } = req.body;
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ customerId }).sort({ orderDate: -1 }).limit(20);
    const segmentTitle = SEGMENT_TITLES[segmentKey] || 'General';

    const offer = await geminiService.generatePersonalizedOffer({ customer, orders, segmentTitle });

    res.json({ success: true, data: { customer: { name: customer.name, email: customer.email, city: customer.city }, offer } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auto-campaign/segments
 * Return all available segments with live customer counts
 */
exports.getSegments = async (req, res) => {
  try {
    const [allCount, hiVal, frequent, newC, crossSell, churn] = await Promise.all([
      Customer.countDocuments(),
      (async () => { const ago = new Date(Date.now() - 30 * 86400000); return Customer.countDocuments({ totalSpent: { $gt: 5000 }, $or: [{ lastPurchaseDate: { $lt: ago } }, { lastPurchaseDate: null }] }); })(),
      (async () => { const c = await Order.aggregate([{ $group: { _id: '$customerId', c: { $sum: 1 } } }, { $match: { c: { $gt: 5 } } }]); return c.length; })(),
      (async () => { const c = await Order.aggregate([{ $group: { _id: '$customerId', c: { $sum: 1 } } }, { $match: { c: 1 } }]); return c.length; })(),
      (async () => { const shoes = await Order.distinct('customerId', { category: 'Shoes' }); const socks = new Set((await Order.distinct('customerId', { category: 'Socks' })).map(String)); return shoes.filter(id => !socks.has(String(id))).length; })(),
      (async () => { const ago = new Date(Date.now() - 45 * 86400000); return Customer.countDocuments({ $or: [{ lastPurchaseDate: { $lt: ago } }, { lastPurchaseDate: null }] }); })()
    ]);

    res.json({
      success: true,
      data: [
        { key: 'all', title: 'All Customers', description: 'Send AI offers to your entire customer base', count: allCount, icon: '👥', color: '#5B4CF5' },
        { key: 'high_value_inactive', title: 'High Value Inactive', description: 'Spent >₹5,000 but no purchase in 30+ days', count: hiVal, icon: '💎', color: '#9B59FF' },
        { key: 'frequent_buyers', title: 'Frequent Buyers', description: 'More than 5 orders — your power users', count: frequent, icon: '🔥', color: '#F59E0B' },
        { key: 'new_customers', title: 'New Customers', description: 'Only 1 order — nurture into loyal buyers', count: newC, icon: '🌱', color: '#22C55E' },
        { key: 'cross_sell', title: 'Cross-Sell Opportunities', description: 'Bought Shoes but never Socks', count: crossSell, icon: '🛒', color: '#3B82F6' },
        { key: 'churn_risk', title: 'Churn Risk', description: 'No purchase in 45+ days — act now', count: churn, icon: '⚠️', color: '#EF4444' }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
