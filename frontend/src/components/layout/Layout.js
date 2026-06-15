import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Tooltip,
  useTheme, useMediaQuery, Divider, Chip
} from '@mui/material';
import {
  DashboardRounded, PeopleRounded, ShoppingCartRounded, TravelExploreRounded,
  CampaignRounded, SettingsRounded, MenuRounded, NotificationsRounded,
  LightModeRounded, DarkModeRounded, AutoAwesomeRounded, CloseRounded,
  BoltRounded
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import NotificationsPanel from '../common/NotificationsPanel';

const DRAWER_WIDTH = 262;

const NAV_ITEMS = [
  { label: 'Dashboard',          icon: <DashboardRounded />,    path: '/dashboard' },
  { label: 'Customers',          icon: <PeopleRounded />,        path: '/customers' },
  { label: 'Orders',             icon: <ShoppingCartRounded />,  path: '/orders' },
  { label: 'Audience Discovery', icon: <TravelExploreRounded />, path: '/audiences', badge: 'AI' },
  { label: 'Campaigns',          icon: <CampaignRounded />,      path: '/campaigns' },
  { label: 'AI Campaign Engine', icon: <BoltRounded />,          path: '/ai-campaign', badge: 'NEW', highlight: true },
  { label: 'Settings',           icon: <SettingsRounded />,      path: '/settings' }
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const { themeMode, toggleTheme } = useApp();
  const currentPage = NAV_ITEMS.find(n => location.pathname.startsWith(n.path));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#5B4CF5,#9B59FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AutoAwesomeRounded sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>SmartReach</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI CRM</Typography>
        </Box>
        {isMobile && <IconButton size="small" onClick={() => setMobileOpen(false)}><CloseRounded fontSize="small" /></IconButton>}
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2.5, px: 1.5, py: 1,
                  bgcolor: active ? (item.highlight ? 'linear-gradient(135deg,#5B4CF5,#9B59FF)' : 'primary.main') : 'transparent',
                  background: active && item.highlight ? 'linear-gradient(135deg,#5B4CF5,#9B59FF)' : active ? 'primary.main' : 'transparent',
                  color: active ? 'white' : 'text.secondary',
                  border: !active && item.highlight ? '1px solid rgba(91,76,245,0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: active ? 'primary.dark' : item.highlight ? 'rgba(91,76,245,0.08)' : 'action.hover',
                    color: active ? 'white' : 'text.primary',
                  },
                  transition: 'all 0.15s'
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 20 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : item.highlight ? 600 : 500 }}
                />
                {item.badge && (
                  <Chip label={item.badge} size="small" sx={{
                    height: 20, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
                    background: active ? 'rgba(255,255,255,0.25)' : item.highlight ? 'linear-gradient(135deg,#5B4CF5,#9B59FF)' : 'linear-gradient(135deg,#5B4CF5,#9B59FF)',
                    color: 'white'
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg,rgba(91,76,245,0.08),rgba(155,89,255,0.08))', border: '1px solid rgba(91,76,245,0.15)' }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" display="block">✨ Gemini AI Integrated</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Real-time personalized offers</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: theme.palette.mode === 'light' ? '2px 0 20px rgba(0,0,0,0.05)' : '2px 0 20px rgba(0,0,0,0.3)' }
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} size="small" edge="start"><MenuRounded /></IconButton>}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>{currentPage?.label || 'SmartReach'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
            <Tooltip title={themeMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
                {themeMode === 'light' ? <DarkModeRounded fontSize="small" /> : <LightModeRounded fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={e => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={2} color="error"><NotificationsRounded fontSize="small" /></Badge>
              </IconButton>
            </Tooltip>
            <Avatar sx={{ width: 34, height: 34, cursor: 'pointer', background: 'linear-gradient(135deg,#5B4CF5,#9B59FF)', fontSize: '0.85rem', fontWeight: 700 }}>SR</Avatar>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      <NotificationsPanel anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)} />
    </Box>
  );
}
