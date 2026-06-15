require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const Communication = require('../models/Communication');
const AudienceDiscovery = require('../models/AudienceDiscovery');

const CATEGORIES = ['Shoes', 'Socks', 'Clothing', 'Electronics', 'Accessories', 'Sports', 'Home', 'Books', 'Beauty'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push', 'In-App'];
const FIRST_NAMES = ['Aarav', 'Priya', 'Rahul', 'Neha', 'Arjun', 'Anjali', 'Vikram', 'Pooja', 'Rohit', 'Deepa', 'Sanjay', 'Meera', 'Aditya', 'Kavya', 'Kunal', 'Shreya', 'Ravi', 'Ananya', 'Amit', 'Sneha'];
const LAST_NAMES = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Verma', 'Joshi', 'Gupta', 'Nair', 'Reddy', 'Mehta', 'Iyer', 'Rao', 'Mishra', 'Chaudhari', 'Shah'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n) { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Campaign.deleteMany({}),
    Communication.deleteMany({}),
    AudienceDiscovery.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create 50 customers
  const customers = [];
  for (let i = 0; i < 50; i++) {
    const name = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    const emailName = name.toLowerCase().replace(' ', '.') + randomInt(1, 99);
    customers.push({
      name,
      email: `${emailName}@example.com`,
      phone: `+91${randomInt(7000000000, 9999999999)}`,
      city: randomItem(CITIES),
      totalSpent: 0,
      lastPurchaseDate: null,
      createdAt: daysAgo(randomInt(1, 180))
    });
  }
  const savedCustomers = await Customer.insertMany(customers);
  console.log(`Created ${savedCustomers.length} customers`);

  // Create orders
  const orders = [];
  for (const customer of savedCustomers) {
    const orderCount = randomInt(0, 12);
    let totalSpent = 0;
    let lastDate = null;
    for (let j = 0; j < orderCount; j++) {
      const amount = randomInt(200, 8000);
      const orderDate = daysAgo(randomInt(0, 120));
      totalSpent += amount;
      if (!lastDate || orderDate > lastDate) lastDate = orderDate;
      orders.push({
        customerId: customer._id,
        amount,
        category: randomItem(CATEGORIES),
        orderDate
      });
    }
    // Update customer totalSpent and lastPurchaseDate
    await Customer.findByIdAndUpdate(customer._id, { totalSpent, lastPurchaseDate: lastDate });
  }
  const savedOrders = await Order.insertMany(orders);
  console.log(`Created ${savedOrders.length} orders`);

  // Create campaigns
  const campaignData = [
    { name: 'VIP Win-Back Campaign', audienceName: 'High Value Inactive Customers', channel: 'Email', message: 'We miss you! Here\'s 25% off exclusively for our top customers. Use code VIPBACK25 — expires in 72 hours.', status: 'Completed', audienceSize: 12 },
    { name: 'Loyalty Rewards Blast', audienceName: 'Frequent Buyers', channel: 'WhatsApp', message: 'You\'re in our VIP circle! Get early access to our new collection + double loyalty points this weekend.', status: 'Completed', audienceSize: 8 },
    { name: 'Welcome Series #1', audienceName: 'New Customers', channel: 'Email', message: 'Welcome! Your first purchase unlocked 15% off your second order. Code: WELCOME15 — valid 7 days.', status: 'Active', audienceSize: 15 },
    { name: 'Cross-Sell Socks Bundle', audienceName: 'Cross-Sell Opportunities', channel: 'Push', message: 'Complete your look! Bundle socks with your shoes for 20% off. Limited time offer!', status: 'Draft', audienceSize: 20 },
    { name: 'Churn Prevention Alert', audienceName: 'Churn Risk Customers', channel: 'SMS', message: 'We haven\'t seen you in a while! Use COMEBACK30 for 30% off — expires in 48 hours.', status: 'Active', audienceSize: 18 }
  ];

  const savedCampaigns = await Campaign.insertMany(
    campaignData.map(c => ({ ...c, sentAt: c.status !== 'Draft' ? daysAgo(randomInt(1, 30)) : null }))
  );
  console.log(`Created ${savedCampaigns.length} campaigns`);

  // Create communications for completed/active campaigns
  const comms = [];
  const statuses = ['Sent', 'Delivered', 'Opened', 'Clicked', 'Failed'];
  for (const campaign of savedCampaigns.filter(c => c.status !== 'Draft')) {
    const recipients = savedCustomers.slice(0, campaign.audienceSize || 10);
    let delivered = 0, opened = 0, clicked = 0, failed = 0;
    for (const cust of recipients) {
      const rand = Math.random();
      let status;
      if (rand < 0.08) { status = 'Failed'; failed++; }
      else if (rand < 0.40) { status = 'Delivered'; delivered++; }
      else if (rand < 0.70) { status = 'Opened'; opened++; }
      else { status = 'Clicked'; clicked++; }
      comms.push({
        campaignId: campaign._id,
        customerId: cust._id,
        status,
        statusHistory: [{ status: 'Sent', timestamp: campaign.sentAt }],
        timestamp: campaign.sentAt || new Date()
      });
    }
    await Campaign.findByIdAndUpdate(campaign._id, {
      'stats.sent': recipients.length,
      'stats.delivered': delivered + opened + clicked,
      'stats.opened': opened + clicked,
      'stats.clicked': clicked,
      'stats.failed': failed
    });
  }
  await Communication.insertMany(comms);
  console.log(`Created ${comms.length} communications`);

  console.log('\n🎉 Seed complete! Demo data ready.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
