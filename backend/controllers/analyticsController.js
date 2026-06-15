const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const Communication = require('../models/Communication');
const AudienceDiscovery = require('../models/AudienceDiscovery');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalOrders,
      totalCampaigns,
      activeCampaigns,
      recentDiscoveries,
      recentCustomers,
      ordersByCategory,
      revenueByMonth,
      campaignsByStatus
    ] = await Promise.all([
      Customer.countDocuments(),
      Order.countDocuments(),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'Active' }),
      AudienceDiscovery.find().sort({ createdAt: -1 }).limit(5),
      Customer.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { revenue: -1 } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$orderDate' },
              month: { $month: '$orderDate' }
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      Campaign.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenue = revenueByMonth.map(r => ({
      month: months[r._id.month - 1],
      year: r._id.year,
      revenue: r.revenue,
      orders: r.orders
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalOrders,
          totalCampaigns,
          activeCampaigns,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentCustomers,
        recentDiscoveries,
        ordersByCategory,
        revenueByMonth: formattedRevenue,
        campaignsByStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
