import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Avatar, Chip, Divider, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
  LinearProgress, Skeleton
} from '@mui/material';
import {
  CloseRounded, EmailRounded, PhoneRounded, LocationOnRounded,
  ShoppingCartRounded, AttachMoneyRounded, CalendarTodayRounded
} from '@mui/icons-material';
import { customerAPI } from '../../services/api';
import { formatCurrency, formatDate, timeAgo } from '../../utils/format';

const CAT_COLORS = {
  Shoes: '#5B4CF5', Socks: '#9B59FF', Clothing: '#3B82F6', Electronics: '#22C55E',
  Accessories: '#F59E0B', Sports: '#EF4444', Home: '#06B6D4', Books: '#EC4899',
  Beauty: '#8B5CF6', Other: '#9CA3AF'
};

export default function CustomerDetailDrawer({ customerId, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    setData(null);
    customerAPI.getStats(customerId)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId, open]);

  const customer = data?.customer;
  const orders = data?.orders || [];
  const stats = data?.stats || {};

  // category breakdown
  const catBreakdown = orders.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + o.amount;
    return acc;
  }, {});
  const topCat = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);
  const maxCatVal = topCat[0]?.[1] || 1;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 420 },
          borderRadius: { xs: 0, sm: '16px 0 0 16px' },
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #5B4CF5 0%, #9B59FF 100%)',
        p: 3, color: 'white', position: 'relative'
      }}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseRounded />
        </IconButton>

        {loading || !customer ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={56} height={56} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Box>
              <Skeleton width={140} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 0.5 }} />
              <Skeleton width={180} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar sx={{
                width: 56, height: 56, fontSize: '1.4rem', fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)'
              }}>
                {customer.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{customer.name}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Customer since {formatDate(customer.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5, py: 1, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800}>{formatCurrency(stats.totalSpent)}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total Spent</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5, py: 1, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800}>{stats.totalOrders}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Orders</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5, py: 1, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800}>
                  {stats.totalOrders > 0 ? formatCurrency(stats.totalSpent / stats.totalOrders) : '₹0'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Avg Order</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} height={20} sx={{ borderRadius: 1 }} />)}
          </Box>
        ) : customer ? (
          <>
            {/* Contact info */}
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 700 }}>
              Contact Info
            </Typography>
            <Box sx={{ mt: 1, mb: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { icon: <EmailRounded sx={{ fontSize: 16 }} />, value: customer.email },
                { icon: <PhoneRounded sx={{ fontSize: 16 }} />, value: customer.phone || 'Not provided' },
                { icon: <LocationOnRounded sx={{ fontSize: 16 }} />, value: customer.city || 'Unknown city' },
                { icon: <CalendarTodayRounded sx={{ fontSize: 16 }} />, value: `Last purchase: ${formatDate(customer.lastPurchaseDate) || 'Never'}` }
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ color: 'text.secondary', flexShrink: 0 }}>{item.icon}</Box>
                  <Typography variant="body2" color={item.value === 'Not provided' ? 'text.disabled' : 'text.primary'}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Category spending breakdown */}
            {topCat.length > 0 && (
              <>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 700 }}>
                  Spending by Category
                </Typography>
                <Box sx={{ mt: 1.5, mb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {topCat.slice(0, 5).map(([cat, amt]) => (
                    <Box key={cat}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CAT_COLORS[cat] || '#9CA3AF' }} />
                          <Typography variant="body2" fontWeight={600}>{cat}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: CAT_COLORS[cat] || '#9CA3AF' }}>
                          {formatCurrency(amt)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(amt / maxCatVal) * 100}
                        sx={{
                          height: 5, borderRadius: 3, bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': { bgcolor: CAT_COLORS[cat] || '#9CA3AF', borderRadius: 3 }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ mb: 2.5 }} />
              </>
            )}

            {/* Recent Orders */}
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 700 }}>
              Recent Orders ({orders.length})
            </Typography>
            {orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ShoppingCartRounded sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No orders yet</Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 1.5 }}>
                {orders.slice(0, 10).map((order, i) => (
                  <Box key={order._id} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    py: 1.25, borderBottom: i < orders.length - 1 ? '1px solid' : 'none', borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: 1.5,
                        bgcolor: `${CAT_COLORS[order.category] || '#9CA3AF'}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: CAT_COLORS[order.category] || '#9CA3AF'
                      }}>
                        <ShoppingCartRounded sx={{ fontSize: 14 }} />
                      </Box>
                      <Box>
                        <Chip label={order.category} size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600,
                            bgcolor: `${CAT_COLORS[order.category] || '#9CA3AF'}18`,
                            color: CAT_COLORS[order.category] || '#9CA3AF' }} />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {timeAgo(order.orderDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {formatCurrency(order.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Typography color="text.secondary">Failed to load customer data.</Typography>
        )}
      </Box>
    </Drawer>
  );
}
