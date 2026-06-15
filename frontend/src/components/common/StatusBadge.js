import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../utils/format';

export default function StatusBadge({ status, size = 'small' }) {
  const color = STATUS_COLORS[status] || '#9CA3AF';
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 22 : 28,
        letterSpacing: '0.02em'
      }}
    />
  );
}
