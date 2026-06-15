import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export function PageHeader({ title, subtitle, action, actionIcon, onAction }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {action && (
        <Button variant="contained" startIcon={actionIcon} onClick={onAction} sx={{ flexShrink: 0 }}>
          {action}
        </Button>
      )}
    </Box>
  );
}

export function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', py: 8, px: 3, textAlign: 'center'
    }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(91,76,245,0.1), rgba(155,89,255,0.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2.5, color: 'primary.main'
      }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      {description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 320 }}>{description}</Typography>}
      {action && <Button variant="contained" onClick={onAction}>{action}</Button>}
    </Box>
  );
}

export function LoadingRows({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <Box key={i} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
      {[80, 160, 120, 100, 80].map((w, j) => (
        <Box key={j} sx={{ height: 14, width: w, bgcolor: 'action.hover', borderRadius: 1, animation: 'pulse 1.5s infinite' }} />
      ))}
    </Box>
  ));
}
