import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Divider, Switch, FormControlLabel, Alert, CircularProgress,
  InputAdornment, IconButton, Chip
} from '@mui/material';
import {
  SaveRounded, VisibilityRounded, VisibilityOffRounded,
  AutoAwesomeRounded, PaletteRounded, PersonRounded, EmailRounded,
  CheckCircleRounded, ErrorRounded
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { settingsAPI } from '../services/api';
import api from '../services/api';
import { PageHeader } from '../components/common/PageElements';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const [settings, setSettings] = useState({
    geminiApiKey: '', profileName: 'Admin User', profileEmail: 'admin@smartreach.ai',
    emailEnabled: 'false', smtpUser: '', smtpPass: '', smtpFrom: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { themeMode, toggleTheme } = useApp();

  useEffect(() => {
    settingsAPI.get()
      .then(r => setSettings(s => ({ ...s, ...r.data.data })))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      enqueueSnackbar('Settings saved!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setSaving(false); }
  };

  const testEmailConnection = async () => {
    setTestingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.get('/settings/test-email');
      setEmailStatus(res.data);
    } catch (err) {
      setEmailStatus({ ok: false, reason: err.message });
    } finally { setTestingEmail(false); }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Configure SmartReach AI CRM" />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* AI Config */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#5B4CF5,#9B59FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AutoAwesomeRounded sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Gemini AI Configuration</Typography>
                  <Typography variant="caption" color="text.secondary">Powers AI Campaign Engine & audience insights</Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                Get your free API key at <strong>aistudio.google.com</strong>. Without a key, the system uses smart fallback offers.
              </Alert>
              <TextField
                label="Gemini API Key"
                value={settings.geminiApiKey || ''}
                onChange={e => setSettings(s => ({ ...s, geminiApiKey: e.target.value }))}
                fullWidth size="small"
                type={showKey ? 'text' : 'password'}
                placeholder="AIza••••••••••••••••••••••••••••••••••"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </CardContent>
          </Card>

          {/* Email Config */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#22C55E,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmailRounded sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Email Configuration</Typography>
                  <Typography variant="caption" color="text.secondary">Required for AI Campaign Engine to send real emails</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, border: '1px solid', borderColor: settings.emailEnabled === 'true' ? 'success.main' : 'divider', borderRadius: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailEnabled === 'true'}
                      onChange={e => setSettings(s => ({ ...s, emailEnabled: e.target.checked ? 'true' : 'false' }))}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Enable Real Email Sending</Typography>
                      <Typography variant="caption" color="text.secondary">When disabled, AI campaigns simulate delivery only</Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              </Box>

              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Use <strong>Gmail</strong> with an App Password (2FA must be on). Go to Google Account → Security → App Passwords.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Gmail Address" size="small" fullWidth
                    value={settings.smtpUser || ''}
                    onChange={e => setSettings(s => ({ ...s, smtpUser: e.target.value }))}
                    placeholder="yourname@gmail.com"
                    disabled={settings.emailEnabled !== 'true'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Gmail App Password" size="small" fullWidth
                    type={showPass ? 'text' : 'password'}
                    value={settings.smtpPass || ''}
                    onChange={e => setSettings(s => ({ ...s, smtpPass: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    disabled={settings.emailEnabled !== 'true'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass(!showPass)} disabled={settings.emailEnabled !== 'true'}>
                            {showPass ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="From Name / Address (optional)" size="small" fullWidth
                    value={settings.smtpFrom || ''}
                    onChange={e => setSettings(s => ({ ...s, smtpFrom: e.target.value }))}
                    placeholder="SmartReach Store <yourname@gmail.com>"
                    disabled={settings.emailEnabled !== 'true'}
                  />
                </Grid>
              </Grid>

              {emailStatus && (
                <Alert severity={emailStatus.ok ? 'success' : 'error'} sx={{ mt: 2, borderRadius: 2 }}
                  icon={emailStatus.ok ? <CheckCircleRounded /> : <ErrorRounded />}>
                  {emailStatus.ok ? 'SMTP connection successful! Real emails will be sent.' : `Connection failed: ${emailStatus.reason}`}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button variant="outlined" size="small" onClick={testEmailConnection}
                  disabled={testingEmail || settings.emailEnabled !== 'true'}
                  startIcon={testingEmail ? <CircularProgress size={14} /> : <EmailRounded />}>
                  {testingEmail ? 'Testing…' : 'Test Connection'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#3B82F6,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PersonRounded sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Profile Settings</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Display Name" value={settings.profileName || ''} onChange={e => setSettings(s => ({ ...s, profileName: e.target.value }))} fullWidth size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email Address" value={settings.profileEmail || ''} onChange={e => setSettings(s => ({ ...s, profileEmail: e.target.value }))} fullWidth size="small" type="email" />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
                <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                  onClick={handleSave} disabled={saving}>
                  Save All Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#9B59FF,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PaletteRounded sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Appearance</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={themeMode === 'dark'} onChange={toggleTheme} color="primary" />}
                  label={<Box><Typography variant="body2" fontWeight={600}>Dark Mode</Typography><Typography variant="caption" color="text.secondary">{themeMode === 'dark' ? 'Dark theme active' : 'Light theme active'}</Typography></Box>}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" fontWeight={600} mb={1}>AI Status</Typography>
              <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg,rgba(91,76,245,0.08),rgba(155,89,255,0.08))', border: '1px solid rgba(91,76,245,0.15)', mb: 2 }}>
                <Chip size="small"
                  label={settings.geminiApiKey && settings.geminiApiKey.length > 8 ? '✅ Gemini Connected' : '⚠️ No API Key'}
                  sx={{ bgcolor: settings.geminiApiKey && settings.geminiApiKey.length > 8 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: settings.geminiApiKey && settings.geminiApiKey.length > 8 ? 'success.main' : 'warning.main', fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={1} sx={{ fontSize: '0.7rem' }}>
                  {settings.geminiApiKey && settings.geminiApiKey.length > 8
                    ? 'Live AI offers will be generated for each customer.'
                    : 'Add your Gemini key for live AI-written offers. Smart fallbacks are used without it.'}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} mb={1}>Email Status</Typography>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Chip size="small"
                  label={settings.emailEnabled === 'true' ? '✅ Email Enabled' : '📧 Simulation Mode'}
                  sx={{ bgcolor: settings.emailEnabled === 'true' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)', color: settings.emailEnabled === 'true' ? 'success.main' : 'info.main', fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={1} sx={{ fontSize: '0.7rem' }}>
                  {settings.emailEnabled === 'true'
                    ? 'Real emails will be sent to customers via Gmail.'
                    : 'Campaigns will simulate delivery. No real emails sent.'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">SmartReach AI CRM v1.0.0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
