const Customer = require('../models/Customer');
const Order = require('../models/Order');
const AudienceDiscovery = require('../models/AudienceDiscovery');
const geminiService = require('../services/geminiService');

const AUDIENCE_RULES = {
  high_value_inactive: {
    title: 'High Value Inactive Customers',
    description: 'Customers who spent over ₹5,000 but haven\'t purchased in the last 30 days.',
    recommendation: 'Re-engage with exclusive loyalty offers and personalized win-back campaigns.'
  },
  frequent_buyers: {
    title: 'Frequent Buyers',
    description: 'Customers with more than 5 orders — your most engaged power users.',
    recommendation: 'Reward loyalty with VIP programs, early access, and exclusive deals.'
  },
  new_customers: {
    title: 'New Customers',
    description: 'Customers who have placed only one order so far.',
    recommendation: 'Nurture with onboarding sequences, second-purchase discounts, and brand storytelling.'
  },
  cross_sell: {
    title: 'Cross-Sell Opportunities',
    description: 'Customers who bought Shoes but have never purchased Socks.',
    recommendation: 'Drive bundle purchases with "Complete the Look" campaigns and combo discounts.'
  },
  churn_risk: {
    title: 'Churn Risk Customers',
    description: 'Customers with no purchase in the last 45 days.',
    recommendation: 'Deploy urgent re-engagement campaigns with time-sensitive offers before they\'re lost.'
  }
};

async function discoverHighValueInactive() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const customers = await Customer.find({
    totalSpent: { $gt: 5000 },
    $or: [
      { lastPurchaseDate: { $lt: thirtyDaysAgo } },
      { lastPurchaseDate: null }
    ]
  });
  return customers;
}

async function discoverFrequentBuyers() {
  const orderCounts = await Order.aggregate([
    { $group: { _id: '$customerId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 5 } } }
  ]);
  const ids = orderCounts.map(o => o._id);
  return Customer.find({ _id: { $in: ids } });
}

async function discoverNewCustomers() {
  const orderCounts = await Order.aggregate([
    { $group: { _id: '$customerId', count: { $sum: 1 } } },
    { $match: { count: 1 } }
  ]);
  const ids = orderCounts.map(o => o._id);
  return Customer.find({ _id: { $in: ids } });
}

async function discoverCrossSellOpportunities() {
  const shoesBuyers = await Order.distinct('customerId', { category: 'Shoes' });
  const socksBuyers = await Order.distinct('customerId', { category: 'Socks' });
  const socksBuyerSet = new Set(socksBuyers.map(id => id.toString()));
  const targetIds = shoesBuyers.filter(id => !socksBuyerSet.has(id.toString()));
  return Customer.find({ _id: { $in: targetIds } });
}

async function discoverChurnRisk() {
  const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  const customers = await Customer.find({
    $or: [
      { lastPurchaseDate: { $lt: fortyFiveDaysAgo } },
      { lastPurchaseDate: null }
    ]
  });
  return customers;
}

exports.discoverAudiences = async (req, res) => {
  try {
    const [highValue, frequent, newCust, crossSell, churnRisk] = await Promise.all([
      discoverHighValueInactive(),
      discoverFrequentBuyers(),
      discoverNewCustomers(),
      discoverCrossSellOpportunities(),
      discoverChurnRisk()
    ]);

    const discoveries = [
      { ...AUDIENCE_RULES.high_value_inactive, ruleKey: 'high_value_inactive', customers: highValue },
      { ...AUDIENCE_RULES.frequent_buyers, ruleKey: 'frequent_buyers', customers: frequent },
      { ...AUDIENCE_RULES.new_customers, ruleKey: 'new_customers', customers: newCust },
      { ...AUDIENCE_RULES.cross_sell, ruleKey: 'cross_sell', customers: crossSell },
      { ...AUDIENCE_RULES.churn_risk, ruleKey: 'churn_risk', customers: churnRisk }
    ].map(d => ({
      title: d.title,
      description: d.description,
      audienceSize: d.customers.length,
      recommendation: d.recommendation,
      ruleKey: d.ruleKey,
      customerIds: d.customers.map(c => c._id)
    }));

    res.json({ success: true, data: discoveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAIRecommendation = async (req, res) => {
  try {
    const { title, description, audienceSize, recommendation, ruleKey } = req.body;

    const aiSuggestion = await geminiService.getAudienceRecommendation({
      title,
      description,
      audienceSize,
      recommendation
    });

    // Save to DB
    const existing = await AudienceDiscovery.findOne({ ruleKey });
    if (existing) {
      existing.aiSuggestion = aiSuggestion;
      existing.audienceSize = audienceSize;
      await existing.save();
    } else {
      await AudienceDiscovery.create({
        title, description, audienceSize, recommendation, ruleKey,
        aiSuggestion
      });
    }

    res.json({ success: true, data: aiSuggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedDiscoveries = async (req, res) => {
  try {
    const discoveries = await AudienceDiscovery.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: discoveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
