import React, { useState, useEffect } from 'react';
import {
  Popover, Box, Typography, IconButton, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Chip, Button
} from '@mui/material';
import {
  NotificationsRounded, CampaignRounded, PeopleRounded,
  TravelExploreRounded, CheckCircleRounded, CloseRounded
} from '@mui/icons-material';
import { timeAgo } from '../../utils/format';

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'campaign', title: 'Campaign Delivered', body: '"VIP Win-Back" reached 92% delivery rate', time: new Date(Date.now() - 5 * 60000), read: false, color: '#22C55E' },
  { id: 2, type: 'audience', title: 'New Audience Found', body: '18 churn-risk customers identified', time: new Date(Date.now() - 30 * 60000), read: false, color: '#9B59FF' },
  { id: 3, type: 'customer', title: 'New Customers', body: '3 customers joined in the last hour', time: new Date(Date.now() - 2 * 3600000), read: true, color: '#3B82F6' },
  { id: 4, type: 'campaign', title: 'Campaign Completed', body: '"Welcome Series #1" finished sending', time: new Date(Date.now() - 24 * 3600000), read: true, color: '#F59E0B' },
];

const TYPE_ICONS = {
  campaign: <CampaignRounded sx={{ fontSize: 16 }} />,
  audience: <TravelExploreRounded sx={{ fontSize: 16 }} />,
  customer: <PeopleRounded sx={{ fontSize: 16 }} />
};

export default function NotificationsPanel({ anchorEl, open, onClose }) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications(ns => ns.filter(n => n.id !== id));

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 360,
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          mt: 1
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid', borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">Notifications</Typography>
          {unread > 0 && (
            <Chip label={unread} size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'primary.main', color: 'white' }} />
          )}
        </Box>
        {unread > 0 && (
          <Button size="small" onClick={markAllRead} sx={{ fontSize: '0.75rem', p: 0.5, minWidth: 0 }}>
            Mark all read
          </Button>
        )}
      </Box>

      {/* List */}
      <List disablePadding sx={{ maxHeight: 360, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleRounded sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">All caught up!</Typography>
          </Box>
        ) : notifications.map((n, i) => (
          <React.Fragment key={n.id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 2, py: 1.5,
                bgcolor: !n.read ? 'action.hover' : 'transparent',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: 'action.selected' }
              }}
              secondaryAction={
                <IconButton size="small" edge="end" onClick={() => dismiss(n.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                  <CloseRounded sx={{ fontSize: 14 }} />
                </IconButton>
              }
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: `${n.color}18`, color: n.color }}>
                  {TYPE_ICONS[n.type]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pr: 2 }}>
                    <Typography variant="body2" fontWeight={n.read ? 500 : 700}>{n.title}</Typography>
                    {!n.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">{n.body}</Typography>
                    <Typography variant="caption" color="text.disabled" display="block">{timeAgo(n.time)}</Typography>
                  </Box>
                }
              />
            </ListItem>
            {i < notifications.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Popover>
  );
}
