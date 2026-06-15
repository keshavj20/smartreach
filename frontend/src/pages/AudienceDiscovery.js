import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Divider,
  CircularProgress, Collapse, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, IconButton
} from '@mui/material';
import {
  TravelExploreRounded, AutoAwesomeRounded, CampaignRounded,
  PeopleRounded, LightbulbRounded, SendRounded, RefreshRounded, CloseRounded
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { audienceAPI, campaignAPI } from '../services/api';
import { PageHeader } from '../components/common/PageElements';
import { CHANNELS } from '../utils/format';

const AUDIENCE_ICONS = {
  high_value_inactive: '💎',
  frequent_buyers: '🔥',
  new_customers: '🌱',
  cross_sell: '🛒',
  churn_risk: '⚠️'
};

const AUDIENCE_GRADIENTS = {
  high_value_inactive: 'linear-gradient(135deg, #5B4CF5 0%, #9B59FF 100%)',
  frequent_buyers: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  new_customers: 'linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)',
  cross_sell: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  churn_risk: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)'
};

export default function AudienceDiscovery() {
  const [audiences, setAudiences] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [aiData, setAiData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [campaignDialog, setCampaignDialog] = useState(null);
  const [campaignForm, setCampaignForm] = useState({ name: '', channel: 'Email', message: '' });
  const [creating, setCreating] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const res = await audienceAPI.discover();
      setAudiences(res.data.data);
      enqueueSnackbar(`Found ${res.data.data.length} audience segments`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setDiscovering(false);
    }
  };

  const handleGetAI = async (audience) => {
    const key = audience.ruleKey;
    setAiLoading(l => ({ ...l, [key]: true }));
    try {
      const res = await audienceAPI.getAIRecommendation(audience);
      setAiData(d => ({ ...d, [key]: res.data.data }));
      setExpanded(e => ({ ...e, [key]: true }));
      enqueueSnackbar('AI recommendations ready!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setAiLoading(l => ({ ...l, [key]: false }));
    }
  };

  const openCampaign = (audience) => {
    const ai = aiData[audience.ruleKey];
    const channel = ai?.bestChannel?.split('—')[0]?.trim() || 'Email';
    const validChannel = CHANNELS.includes(channel) ? channel : 'Email';
    setCampaignForm({
      name: `${audience.title} Campaign`,
      channel: validChannel,
      message: ai?.personalizedMessage || audience.recommendation,
      audienceName: audience.title,
      audienceSize: audience.audienceSize,
      audienceRuleKey: audience.ruleKey
    });
    setCampaignDialog(audience);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.message) return enqueueSnackbar('Name and message required', { variant: 'warning' });
    setCreating(true);
    try {
      await campaignAPI.create({
        name: campaignForm.name,
        audienceName: campaignForm.audienceName,
        audienceSize: campaignForm.audienceSize,
        channel: campaignForm.channel,
        message: campaignForm.message,
        audienceRuleKey: campaignForm.audienceRuleKey,
        status: 'Draft'
      });
      enqueueSnackbar('Campaign created! Go to Campaigns to send it.', { variant: 'success' });
      setCampaignDialog(null);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Smart Audience Discovery"
        subtitle="AI-powered audience segmentation engine"
      />

      {/* Hero CTA */}
      <Card sx={{
        mb: 3, background: 'linear-gradient(135deg, #5B4CF5 0%, #9B59FF 100%)',
        color: 'white', overflow: 'hidden', position: 'relative'
      }}>
        <Box sx={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeRounded />
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>AI-Powered Engine</Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} mb={0.5}>Discover Your Ideal Audiences</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 480 }}>
                Automatically identify high-value segments from your customer data, get Gemini AI recommendations, and launch targeted campaigns in one click.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={discovering ? <CircularProgress size={18} color="inherit" /> : <TravelExploreRounded />}
              onClick={handleDiscover}
              disabled={discovering}
              sx={{
                bgcolor: 'white', color: 'primary.main', fontWeight: 700,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)' },
                px: 3, py: 1.2
              }}
            >
              {discovering ? 'Discovering…' : audiences.length > 0 ? 'Re-run Discovery' : 'Run Discovery'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Audience Cards */}
      {audiences.length === 0 && !discovering && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" mb={1}>No audiences discovered yet</Typography>
          <Typography variant="body2" color="text.secondary">Click "Run Discovery" to analyze your customer data.</Typography>
        </Box>
      )}

      <Grid container spacing={2.5}>
        {audiences.map(audience => {
          const key = audience.ruleKey;
          const ai = aiData[key];
          const isAiLoading = aiLoading[key];
          const isExpanded = expanded[key];
          const gradient = AUDIENCE_GRADIENTS[key] || AUDIENCE_GRADIENTS.high_value_inactive;

          return (
            <Grid item xs={12} md={6} key={key}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Card Header */}
                  <Box sx={{ background: gradient, p: 2.5, borderRadius: '16px 16px 0 0', color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h2" sx={{ fontSize: '2rem', mb: 0.5 }}>{AUDIENCE_ICONS[key]}</Typography>
                        <Typography variant="h6" fontWeight={700} mb={0.3}>{audience.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{audience.description}</Typography>
                      </Box>
                      <Box sx={{
                        minWidth: 64, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2, p: 1.5
                      }}>
                        <Typography variant="h4" fontWeight={800}>{audience.audienceSize}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>customers</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <LightbulbRounded sx={{ fontSize: 16, color: 'warning.main', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>{audience.recommendation}</Typography>
                      </Box>
                    </Box>

                    {/* AI Recommendation Section */}
                    <Collapse in={isExpanded && !!ai}>
                      {ai && (
                        <Box sx={{
                          p: 2, borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(91,76,245,0.06), rgba(155,89,255,0.06))',
                          border: '1px solid rgba(91,76,245,0.15)'
                        }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, alignItems: 'center' }}>
                            <AutoAwesomeRounded sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Gemini AI Recommendations
                            </Typography>
                          </Box>
                          <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaign Goal</Typography>
                              <Typography variant="body2" mt={0.3}>{ai.campaignGoal}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Channel</Typography>
                              <Box mt={0.3}>
                                <Chip label={ai.bestChannel?.split('—')[0]?.trim()} size="small" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }} />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strategy</Typography>
                              <Typography variant="body2" mt={0.3} color="text.secondary">{ai.marketingStrategy}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personalized Message</Typography>
                              <Box sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" fontStyle="italic">"{ai.personalizedMessage}"</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Collapse>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', flexWrap: 'wrap' }}>
                      {audience.audienceSize > 0 ? (
                        <>
                          <Button
                            size="small" variant="outlined"
                            startIcon={isAiLoading ? <CircularProgress size={14} /> : <AutoAwesomeRounded />}
                            onClick={() => handleGetAI(audience)}
                            disabled={isAiLoading}
                            sx={{ flex: 1 }}
                          >
                            {ai ? 'Refresh AI' : 'Get AI Insights'}
                          </Button>
                          <Button
                            size="small" variant="contained"
                            startIcon={<CampaignRounded />}
                            onClick={() => openCampaign(audience)}
                            sx={{ flex: 1 }}
                          >
                            Create Campaign
                          </Button>
                        </>
                      ) : (
                        <Alert severity="info" sx={{ flex: 1, py: 0.5, fontSize: '0.78rem' }}>
                          No customers match this segment yet
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Campaign Creation Dialog */}
      <Dialog open={!!campaignDialog} onClose={() => setCampaignDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Create Campaign</Typography>
            <Typography variant="caption" color="text.secondary">
              Targeting {campaignDialog?.audienceSize} customers from "{campaignDialog?.title}"
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setCampaignDialog(null)}><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Campaign Name" value={campaignForm.name} onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Channel</InputLabel>
                <Select value={campaignForm.channel} label="Channel" onChange={e => setCampaignForm(f => ({ ...f, channel: e.target.value }))}>
                  {CHANNELS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message" multiline rows={4} fullWidth size="small"
                value={campaignForm.message}
                onChange={e => setCampaignForm(f => ({ ...f, message: e.target.value }))}
                helperText="AI-generated message — edit as needed"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setCampaignDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCampaign} disabled={creating}
            startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <SendRounded />}>
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
