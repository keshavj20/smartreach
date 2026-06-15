import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { TrendingUpRounded, TrendingDownRounded } from '@mui/icons-material';

export default function StatCard({ title, value, subtitle, icon, color = '#5B4CF5', trend, trendLabel, loading }) {
  if (loading) return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );

  const isPositive = trend >= 0;

  return (
    <Card sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${color}18, ${color}30)`,
            color
          }}>
            {icon}
          </Box>
          {trend !== undefined && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.3,
              color: isPositive ? 'success.main' : 'error.main',
              bgcolor: isPositive ? 'success.main' : 'error.main',
              borderRadius: 1.5, px: 1, py: 0.3,
              opacity: 0.9,
              background: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'
            }}>
              {isPositive ? <TrendingUpRounded sx={{ fontSize: 14 }} /> : <TrendingDownRounded sx={{ fontSize: 14 }} />}
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
        {trendLabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {trendLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
