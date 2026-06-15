import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box
} from '@mui/material';
import { WarningAmberRounded } from '@mui/icons-material';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'error',
  onConfirm,
  onCancel
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: `${confirmColor === 'error' ? '#EF4444' : '#F59E0B'}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmColor === 'error' ? 'error.main' : 'warning.main'
          }}>
            <WarningAmberRounded sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ flex: 1 }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
