const Communication = require('../models/Communication');
const Campaign = require('../models/Campaign');

const DELIVERY_STAGES = [
  { status: 'Delivered', delay: 2000, probability: 0.90 },
  { status: 'Opened', delay: 5000, probability: 0.65 },
  { status: 'Clicked', delay: 8000, probability: 0.35 }
];

exports.simulateDelivery = async (campaignId, totalCount) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const communications = await Communication.find({ campaignId, status: 'Sent' });

    let delivered = 0, opened = 0, clicked = 0, failed = 0;

    for (const comm of communications) {
      const rand = Math.random();
      
      if (rand < 0.08) {
        // 8% fail
        comm.status = 'Failed';
        comm.statusHistory.push({ status: 'Failed', timestamp: new Date() });
        failed++;
      } else if (rand < 0.40) {
        // 32% just delivered
        comm.status = 'Delivered';
        comm.statusHistory.push({ status: 'Delivered', timestamp: new Date() });
        delivered++;
      } else if (rand < 0.70) {
        // 30% opened
        comm.status = 'Opened';
        comm.statusHistory.push({ status: 'Delivered', timestamp: new Date() });
        comm.statusHistory.push({ status: 'Opened', timestamp: new Date(Date.now() + 3000) });
        opened++;
      } else {
        // 30% clicked
        comm.status = 'Clicked';
        comm.statusHistory.push({ status: 'Delivered', timestamp: new Date() });
        comm.statusHistory.push({ status: 'Opened', timestamp: new Date(Date.now() + 3000) });
        comm.statusHistory.push({ status: 'Clicked', timestamp: new Date(Date.now() + 6000) });
        clicked++;
      }

      await comm.save();
    }

    // Update campaign stats
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'Completed',
      'stats.delivered': delivered + opened + clicked,
      'stats.opened': opened + clicked,
      'stats.clicked': clicked,
      'stats.failed': failed
    });

    console.log(`✅ Campaign ${campaignId} simulation complete: ${delivered} delivered, ${opened} opened, ${clicked} clicked, ${failed} failed`);
  } catch (err) {
    console.error('Channel simulation error:', err.message);
  }
};

exports.processReceipt = async (req, res) => {
  try {
    const { campaignId, customerId, status, timestamp } = req.body;
    
    const comm = await Communication.findOne({ campaignId, customerId });
    if (!comm) return res.status(404).json({ success: false, message: 'Communication not found' });

    comm.status = status;
    comm.statusHistory.push({ status, timestamp: timestamp || new Date() });
    await comm.save();

    res.json({ success: true, message: 'Receipt processed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
