import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, CircularProgress,
  Tooltip, LinearProgress, Avatar
} from '@mui/material';
import {
  AddRounded, SendRounded, BarChartRounded, DeleteRounded,
  CampaignRounded, CloseRounded, PlayArrowRounded, EditRounded
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../services/api';
import { PageHeader, EmptyState } from '../components/common/PageElements';
import { formatDate, CHANNELS, STATUS_COLORS } from '../utils/format';

const INITIAL_FORM = { name: '', audienceName: '', channel: 'Email', message: '', status: 'Draft' };

const CHANNEL_ICONS = { Email: '📧', SMS: '💬', WhatsApp: '📱', Push: '🔔', 'In-App': '📲' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campaignAPI.getAll({ limit: 50 });
      setCampaigns(res.data.data);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSave = async () => {
    if (!form.name || !form.audienceName || !form.message) return enqueueSnackbar('Fill all required fields', { variant: 'warning' });
    setSaving(true);
    try {
      if (dialog.mode === 'create') {
        await campaignAPI.create(form);
        enqueueSnackbar('Campaign created!', { variant: 'success' });
      } else {
        await campaignAPI.update(dialog.data._id, form);
        enqueueSnackbar('Campaign updated!', { variant: 'success' });
      }
      setDialog({ open: false });
      fetchCampaigns();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setSaving(false); }
  };

  const handleSend = async (campaign) => {
    setSending(s => ({ ...s, [campaign._id]: true }));
    try {
      await campaignAPI.send(campaign._id);
      enqueueSnackbar(`Campaign "${campaign.name}" is sending!`, { variant: 'success' });
      fetchCampaigns();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setSending(s => ({ ...s, [campaign._id]: false })); }
  };

  const handleDelete = async (id) => {
    try {
      await campaignAPI.delete(id);
      enqueueSnackbar('Campaign deleted', { variant: 'success' });
      setDeleteConfirm(null);
      fetchCampaigns();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  const getSuccessRate = (stats) => {
    if (!stats || !stats.sent) return 0;
    return Math.round((stats.delivered / stats.sent) * 100);
  };

  return (
    <Box>
      <PageHeader title="Campaigns" subtitle={`${campaigns.length} campaigns total`}
        action="New Campaign" actionIcon={<AddRounded />}
        onAction={() => { setForm(INITIAL_FORM); setDialog({ open: true, mode: 'create', data: null }); }} />

      {loading ? (
        <Grid container spacing={2.5}>
          {Array(6).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Card sx={{ height: 220 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ height: 14, bgcolor: 'action.hover', borderRadius: 1, mb: 1, width: '60%' }} />
                  <Box sx={{ height: 12, bgcolor: 'action.hover', borderRadius: 1, mb: 2, width: '40%' }} />
                  <Box sx={{ height: 60, bgcolor: 'action.hover', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : campaigns.length === 0 ? (
        <Card>
          <EmptyState icon={<CampaignRounded sx={{ fontSize: 28 }} />} title="No campaigns yet"
            description="Create your first campaign. Use Audience Discovery to get AI-powered audience segments first."
            action="Create Campaign"
            onAction={() => { setForm(INITIAL_FORM); setDialog({ open: true, mode: 'create', data: null }); }} />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {campaigns.map(campaign => {
            const statusColor = STATUS_COLORS[campaign.status] || '#9CA3AF';
            const successRate = getSuccessRate(campaign.stats);
            const isSending = sending[campaign._id];

            return (
              <Grid item xs={12} sm={6} lg={4} key={campaign._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="body1" fontWeight={700} mb={0.3} sx={{ lineHeight: 1.3 }}>{campaign.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip label={campaign.status} size="small"
                            sx={{ bgcolor: `${statusColor}18`, color: statusColor, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                          <Typography variant="caption" color="text.secondary">
                            {CHANNEL_ICONS[campaign.channel]} {campaign.channel}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {campaign.status === 'Draft' && (
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => {
                              setForm({ name: campaign.name, audienceName: campaign.audienceName, channel: campaign.channel, message: campaign.message, status: campaign.status });
                              setDialog({ open: true, mode: 'edit', data: campaign });
                            }}><EditRounded fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm(campaign)}>
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Audience */}
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>TARGET AUDIENCE</Typography>
                      <Typography variant="body2" fontWeight={600} mt={0.3}>{campaign.audienceName}</Typography>
                      {campaign.audienceSize > 0 && (
                        <Typography variant="caption" color="text.secondary">{campaign.audienceSize} recipients</Typography>
                      )}
                    </Box>

                    {/* Message preview */}
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, fontSize: '0.8rem'
                    }}>
                      {campaign.message}
                    </Typography>

                    {/* Stats if sent */}
                    {campaign.status !== 'Draft' && campaign.stats?.sent > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Delivery rate</Typography>
                          <Typography variant="caption" fontWeight={700} color="primary.main">{successRate}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={successRate} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }} />
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                          {[
                            { label: 'Sent', val: campaign.stats.sent, color: '#6B7280' },
                            { label: 'Delivered', val: campaign.stats.delivered, color: '#3B82F6' },
                            { label: 'Opened', val: campaign.stats.opened, color: '#9B59FF' },
                            { label: 'Clicked', val: campaign.stats.clicked, color: '#22C55E' }
                          ].map(s => (
                            <Box key={s.label} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color: s.color, display: 'block' }}>{s.val}</Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{s.label}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                      {campaign.sentAt ? `Sent ${formatDate(campaign.sentAt)}` : `Created ${formatDate(campaign.createdAt)}`}
                    </Typography>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {(campaign.status === 'Active' || campaign.status === 'Completed') && (
                        <Button size="small" variant="outlined" startIcon={<BarChartRounded />}
                          onClick={() => navigate(`/campaigns/${campaign._id}/replay`)} sx={{ flex: 1 }}>
                          View Replay
                        </Button>
                      )}
                      {campaign.status === 'Draft' && (
                        <Button size="small" variant="contained" startIcon={isSending ? <CircularProgress size={14} color="inherit" /> : <SendRounded />}
                          onClick={() => handleSend(campaign)} disabled={isSending} sx={{ flex: 1 }}>
                          {isSending ? 'Sending…' : 'Send Campaign'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{dialog.mode === 'create' ? 'New Campaign' : 'Edit Campaign'}</Typography>
          <IconButton size="small" onClick={() => setDialog({ open: false })}><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Campaign Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" />
            <TextField label="Target Audience *" value={form.audienceName} onChange={e => setForm(f => ({ ...f, audienceName: e.target.value }))} fullWidth size="small" placeholder="e.g. High Value Inactive Customers" />
            <FormControl fullWidth size="small">
              <InputLabel>Channel *</InputLabel>
              <Select value={form.channel} label="Channel *" onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                {CHANNELS.map(c => <MenuItem key={c} value={c}>{CHANNEL_ICONS[c]} {c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Message *" multiline rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} fullWidth size="small" placeholder="Write your campaign message…" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {dialog.mode === 'create' ? 'Create Campaign' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Campaign?</DialogTitle>
        <DialogContent><Typography>Delete "<strong>{deleteConfirm?.name}</strong>"? All communication records will be removed.</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm?._id)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
