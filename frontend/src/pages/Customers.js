import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Typography, InputAdornment, Tooltip, CircularProgress, Skeleton
} from '@mui/material';
import {
  AddRounded, EditRounded, DeleteRounded, SearchRounded,
  PeopleRounded, CloseRounded, OpenInNewRounded, TrendingUpRounded
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { customerAPI } from '../services/api';
import { PageHeader, EmptyState } from '../components/common/PageElements';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomerDetailDrawer from '../components/common/CustomerDetailDrawer';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate, timeAgo } from '../utils/format';
import { useDebounce } from '../hooks/useDebounce';

const INITIAL_FORM = { name: '', email: '', phone: '', city: '', totalSpent: 0 };
const AVATAR_COLORS = ['#5B4CF5', '#9B59FF', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

function getSpendTier(spent) {
  if (spent >= 20000) return { label: 'VIP', color: '#F59E0B' };
  if (spent >= 10000) return { label: 'Gold', color: '#9B59FF' };
  if (spent >= 5000)  return { label: 'Silver', color: '#3B82F6' };
  return { label: 'Regular', color: '#9CA3AF' };
}

export default function Customers() {
  const [customers, setCustomers]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 0, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);
  const [loading, setLoading]       = useState(true);
  const [dialog, setDialog]         = useState({ open: false, mode: 'create', data: null });
  const [form, setForm]             = useState(INITIAL_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailId, setDetailId]     = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({
        page: pagination.page + 1,
        limit: pagination.limit,
        search
      });
      setCustomers(res.data.data);
      setPagination(p => ({ ...p, total: res.data.pagination.total }));
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]); // eslint-disable-line

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCreate = () => { setForm(INITIAL_FORM); setDialog({ open: true, mode: 'create', data: null }); };
  const openEdit = (c) => {
    setForm({ name: c.name, email: c.email, phone: c.phone || '', city: c.city || '', totalSpent: c.totalSpent || 0 });
    setDialog({ open: true, mode: 'edit', data: c });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return enqueueSnackbar('Name is required', { variant: 'warning' });
    if (!form.email.trim()) return enqueueSnackbar('Email is required', { variant: 'warning' });
    setSaving(true);
    try {
      if (dialog.mode === 'create') {
        await customerAPI.create(form);
        enqueueSnackbar('Customer created!', { variant: 'success' });
      } else {
        await customerAPI.update(dialog.data._id, form);
        enqueueSnackbar('Customer updated!', { variant: 'success' });
      }
      setDialog({ open: false });
      fetchCustomers();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await customerAPI.delete(deleteTarget._id);
      enqueueSnackbar('Customer deleted', { variant: 'success' });
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle={`${pagination.total.toLocaleString()} total customers`}
        action="Add Customer"
        actionIcon={<AddRounded />}
        onAction={openCreate}
      />

      <Card>
        <CardContent sx={{ p: 2 }}>
          <TextField
            placeholder="Search name, email or city…"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPagination(p => ({ ...p, page: 0 })); }}
            size="small"
            sx={{ mb: 2, maxWidth: 380 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              )
            }}
            fullWidth
          />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Last Purchase</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array(pagination.limit).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        {Array(8).fill(0).map((_, j) => (
                          <TableCell key={j}><Skeleton height={14} sx={{ borderRadius: 1 }} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : customers.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyState
                            icon={<PeopleRounded sx={{ fontSize: 28 }} />}
                            title="No customers found"
                            description={search ? `No results for "${search}"` : 'Add your first customer to get started.'}
                            action={!search ? 'Add Customer' : undefined}
                            onAction={openCreate}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : customers.map((c, i) => {
                      const tier = getSpendTier(c.totalSpent);
                      return (
                        <TableRow key={c._id} hover sx={{ cursor: 'pointer' }}>
                          <TableCell onClick={() => setDetailId(c._id)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{
                                width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700,
                                background: `linear-gradient(135deg,${AVATAR_COLORS[i % AVATAR_COLORS.length]}88,${AVATAR_COLORS[(i + 2) % AVATAR_COLORS.length]}88)`
                              }}>
                                {c.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="body2">{c.city || '—'}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{c.phone || '—'}</Typography></TableCell>
                          <TableCell>
                            <Chip label={tier.label} size="small"
                              sx={{ bgcolor: `${tier.color}18`, color: tier.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {formatCurrency(c.totalSpent)}
                            </Typography>
                          </TableCell>
                          <TableCell><Typography variant="body2">{formatDate(c.lastPurchaseDate)}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">{timeAgo(c.createdAt)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => setDetailId(c._id)}>
                                <OpenInNewRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(c)}>
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page}
            onPageChange={(_, p) => setPagination(prev => ({ ...prev, page: p }))}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={e => setPagination(prev => ({ ...prev, limit: +e.target.value, page: 0 }))}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {dialog.mode === 'create' ? 'Add Customer' : 'Edit Customer'}
          </Typography>
          <IconButton size="small" onClick={() => setDialog({ open: false })}><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" autoFocus />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth size="small" type="email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} fullWidth size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {dialog.mode === 'create' ? 'Create Customer' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer?"
        message={`Delete "${deleteTarget?.name}"? This will also remove all their orders and cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customerId={detailId}
        open={!!detailId}
        onClose={() => setDetailId(null)}
      />
    </Box>
  );
}
