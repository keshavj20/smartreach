import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HomeRounded } from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '60vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', p: 4
    }}>
      <Typography sx={{ fontSize: '5rem', mb: 1, lineHeight: 1 }}>🔭</Typography>
      <Typography variant="h3" fontWeight={800} mb={1}
        sx={{ background: 'linear-gradient(135deg,#5B4CF5,#9B59FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </Typography>
      <Typography variant="h5" fontWeight={700} mb={1}>Page not found</Typography>
      <Typography variant="body1" color="text.secondary" mb={3} maxWidth={360}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" startIcon={<HomeRounded />} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
