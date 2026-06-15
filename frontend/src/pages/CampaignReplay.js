import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, LinearProgress, Skeleton, Divider
} from '@mui/material';
import { ArrowBackRounded, RefreshRounded } from '@mui/icons-material';
import {
  FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { campaignAPI } from '../services/api';
import { formatDate, formatCurrency, STATUS_COLORS } from '../utils/format';
import { useSnackbar } from 'notistack';

const STAGE_COLORS = { Sent: '#6B7280', Delivered: '#3B82F6', Opened: '#9B59FF', Clicked: '#22C55E', Failed: '#EF4444' };
const FUNNEL_COLORS = ['#5B4CF5', '#3B82F6', '#9B59FF', '#22C55E'];

export default function CampaignReplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await campaignAPI.getStats(id);
      setData(res.data.data);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, [id]);

  if (loading) return (
    <Box>
      <Skeleton height={40} width={200} sx={{ mb: 3 }} />
      <Grid container spacing={2.5}>
        {Array(4).fill(0).map((_, i) => <Grid item xs={6} sm={3} key={i}><Skeleton height={100} sx={{ borderRadius: 2 }} /></Grid>)}
        <Grid item xs={12}><Skeleton height={300} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );

  if (!data) return null;

  const { campaign, stats, funnel, communications } = data;
  const statusColor = STATUS_COLORS[campaign.status] || '#9CA3AF';

  const journeyStages = [
    { label: 'Sent', count: stats.total, icon: '📤', color: '#6B7280', desc: 'Messages dispatched' },
    { label: 'Delivered', count: stats.delivered, icon: '📬', color: '#3B82F6', desc: 'Successfully delivered' },
    { label: 'Opened', count: stats.opened, icon: '👁️', color: '#9B59FF', desc: 'Opened by recipients' },
    { label: 'Clicked', count: stats.clicked, icon: '🖱️', color: '#22C55E', desc: 'Links clicked' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/campaigns')} variant="outlined" size="small">
          Campaigns
        </Button>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h5" fontWeight={700}>{campaign.name}</Typography>
            <Chip label={campaign.status} size="small"
              sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 600 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {campaign.audienceName} · {campaign.channel} · {formatDate(campaign.sentAt || campaign.createdAt)}
          </Typography>
        </Box>
        <Button startIcon={<RefreshRounded />} variant="outlined" size="small" onClick={fetchStats}>Refresh</Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Delivery Rate', value: `${stats.deliveryRate}%`, sub: `${stats.delivered} delivered`, color: '#3B82F6' },
          { label: 'Open Rate', value: `${stats.openRate}%`, sub: `${stats.opened} opened`, color: '#9B59FF' },
          { label: 'Click Rate', value: `${stats.clickRate}%`, sub: `${stats.clicked} clicked`, color: '#22C55E' },
          { label: 'Failed', value: stats.failed, sub: 'delivery failures', color: '#EF4444' }
        ].map((m, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: m.color }}>{m.value}</Typography>
                <Typography variant="body2" fontWeight={600}>{m.label}</Typography>
                <Typography variant="caption" color="text.secondary">{m.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Journey Timeline */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2.5}>Campaign Journey</Typography>
              <Box sx={{ position: 'relative' }}>
                {journeyStages.map((stage, i) => (
                  <Box key={stage.label}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: 2.5,
                          bgcolor: `${stage.color}18`, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1.3rem'
                        }}>
                          {stage.icon}
                        </Box>
                        {i < journeyStages.length - 1 && (
                          <Box sx={{ width: 2, height: 32, bgcolor: 'divider', my: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, pb: i < journeyStages.length - 1 ? 0 : 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="body2" fontWeight={700}>{stage.label}</Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: stage.color }}>{stage.count}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{stage.desc}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stats.total > 0 ? (stage.count / stats.total) * 100 : 0}
                          sx={{ mt: 1, height: 5, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: stage.color } }}
                        />
                      </Box>
                    </Box>
                    {i < journeyStages.length - 1 && <Box sx={{ height: 8 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Funnel Chart */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={1}>Funnel</Typography>
              <ResponsiveContainer width="100%" height={240}>
                <FunnelChart>
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Funnel dataKey="count" data={funnel} isAnimationActive>
                    {funnel.map((entry, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i]} />
                    ))}
                    <LabelList position="right" fill="#6B7280" fontSize={12} dataKey="stage" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Status Breakdown</Typography>
              {Object.entries(
                communications.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
              ).map(([status, count], i) => (
                <Box key={status} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STAGE_COLORS[status] || '#9CA3AF' }} />
                      <Typography variant="body2" fontWeight={600}>{status}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>{count}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (count / stats.total) * 100 : 0}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: STAGE_COLORS[status] } }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Communications Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Individual Communications ({communications.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Journey</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {communications.slice(0, 20).map((c, i) => (
                      <TableRow key={c._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                              {c.customerId?.name?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{c.customerId?.name || 'Unknown'}</Typography>
                              <Typography variant="caption" color="text.secondary">{c.customerId?.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={c.status} size="small"
                            sx={{ bgcolor: `${STAGE_COLORS[c.status] || '#9CA3AF'}18`, color: STAGE_COLORS[c.status] || '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {c.statusHistory?.map((h, j) => (
                              <Chip key={j} label={h.status} size="small"
                                sx={{ height: 18, fontSize: '0.65rem', bgcolor: `${STAGE_COLORS[h.status] || '#9CA3AF'}18`, color: STAGE_COLORS[h.status] || '#9CA3AF' }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{formatDate(c.timestamp)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {communications.length > 20 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Showing 20 of {communications.length} records
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
