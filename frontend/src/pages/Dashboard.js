import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Box, Typography, Chip, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Skeleton, Divider
} from '@mui/material';
import {
  PeopleRounded, ShoppingCartRounded, CampaignRounded, RocketLaunchRounded,
  AttachMoneyRounded, TrendingUpRounded
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/common/StatCard';
import { analyticsAPI } from '../services/api';
import { formatCurrency, formatNumber, timeAgo } from '../utils/format';

const COLORS = ['#5B4CF5', '#9B59FF', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

const STATUS_COLORS = {
  Active: '#22C55E', Completed: '#3B82F6', Draft: '#9CA3AF', Paused: '#F59E0B', Failed: '#EF4444'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  return (
    <Box>
      {/* Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total Customers', value: formatNumber(stats.totalCustomers), icon: <PeopleRounded fontSize="small" />, color: '#5B4CF5', subtitle: 'All time', trend: 12, trendLabel: 'vs last month' },
          { title: 'Total Orders', value: formatNumber(stats.totalOrders), icon: <ShoppingCartRounded fontSize="small" />, color: '#3B82F6', subtitle: 'All time', trend: 8 },
          { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <AttachMoneyRounded fontSize="small" />, color: '#22C55E', subtitle: 'Across all orders', trend: 15 },
          { title: 'Total Campaigns', value: formatNumber(stats.totalCampaigns), icon: <CampaignRounded fontSize="small" />, color: '#9B59FF', subtitle: `${stats.activeCampaigns || 0} active` },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...s} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Revenue Overview</Typography>
                  <Typography variant="caption" color="text.secondary">Monthly revenue trend</Typography>
                </Box>
                <Chip label="12 months" size="small" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }} />
              </Box>
              {loading ? <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data?.revenueByMonth || []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B4CF5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#5B4CF5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#5B4CF5" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#5B4CF5' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Status Pie */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Campaign Status</Typography>
              <Typography variant="caption" color="text.secondary">Distribution by status</Typography>
              {loading ? <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto', mt: 2 }} /> : (
                <Box sx={{ mt: 1 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={data?.campaignsByStatus || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        dataKey="count" nameKey="_id" paddingAngle={3}>
                        {(data?.campaignsByStatus || []).map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry._id] || COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {(data?.campaignsByStatus || []).map((s, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[s._id] || COLORS[i] }} />
                        <Typography variant="caption" color="text.secondary">{s._id} ({s.count})</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Orders by Category */}
        <Grid item xs={12} sm={6} lg={5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Orders by Category</Typography>
              <Typography variant="caption" color="text.secondary">Top performing categories</Typography>
              {loading ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, mt: 2 }} /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.ordersByCategory?.slice(0, 6) || []} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {(data?.ordersByCategory || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Customers */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Customers</Typography>
              {loading ? Array(4).fill(0).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              )) : (
                <List dense disablePadding>
                  {(data?.recentCustomers || []).map((c, i) => (
                    <React.Fragment key={c._id}>
                      <ListItem disablePadding sx={{ py: 0.75 }}>
                        <ListItemAvatar>
                          <Avatar sx={{
                            width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700,
                            background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}88, ${COLORS[(i + 2) % COLORS.length]}88)`
                          }}>
                            {c.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{c.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{c.city || c.email}</Typography>}
                        />
                        <Typography variant="caption" color="text.secondary">{timeAgo(c.createdAt)}</Typography>
                      </ListItem>
                      {i < (data?.recentCustomers?.length || 0) - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Discoveries */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>AI Discoveries</Typography>
              {loading ? Array(3).fill(0).map((_, i) => (
                <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              )) : (data?.recentDiscoveries || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No discoveries yet. Run Audience Discovery to get AI insights.</Typography>
              ) : (
                (data?.recentDiscoveries || []).map((d, i) => (
                  <Box key={d._id} sx={{
                    mb: 1.5, p: 1.5, borderRadius: 2,
                    background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}10, ${COLORS[i % COLORS.length]}18)`,
                    border: `1px solid ${COLORS[i % COLORS.length]}25`
                  }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: COLORS[i % COLORS.length] }}>
                      {d.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {d.audienceSize} customers
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
