import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AppProvider, useApp } from './context/AppContext';
import { getTheme } from './utils/theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import AudienceDiscovery from './pages/AudienceDiscovery';
import Campaigns from './pages/Campaigns';
import AICampaign from './pages/AICampaign';
import CampaignReplay from './pages/CampaignReplay';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function ThemedApp() {
  const { themeMode } = useApp();
  const theme = getTheme(themeMode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={4000}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="audiences" element={<AudienceDiscovery />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="ai-campaign" element={<AICampaign />} />
              <Route path="campaigns/:id/replay" element={<CampaignReplay />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return <AppProvider><ThemedApp /></AppProvider>;
}
