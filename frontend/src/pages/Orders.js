import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Typography, InputAdornment, Tooltip, CircularProgress,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { AddRounded, EditRounded, DeleteRounded, SearchRounded, ShoppingCartRounded, CloseRounded } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { orderAPI, customerAPI } from '../services/api';
import { PageHeader, EmptyState } from '../components/common/PageElements';
import { formatCurrency, formatDate, CATEGORIES } from '../utils/format';

const INITIAL_FORM = { customerId: '', amount: '', category: 'Shoes', orderDate: new Date().toISOString().split('T')[0] };

const CAT_COLORS = {
  Shoes: '#5B4CF5', Socks: '#9B59FF', Clothing: '#3B82F6', Electronics: '#22C55E',
  Accessories: '#F59E0B', Sports: '#EF4444', Home: '#06B6D4', Books: '#EC4899', Beauty: '#8B5CF6', Other: '#9CA3AF'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(INITIAL_FORM);
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({ page: pagination.page + 1, limit: pagination.limit, search, category: filterCat });
      setOrders(res.data.data);
      setPagination(p => ({ ...p, total: res.data.pagination.total }));
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setLoading(false); }
  }, [pagination.page, pagination.limit, search, filterCat]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openCreate = async () => {
    if (customers.length === 0) {
      const res = await customerAPI.getAll({ limit: 100 });
      setCustomers(res.data.data);
    }
    setForm(INITIAL_FORM);
    setDialog({ open: true, mode: 'create', data: null });
  };

  const openEdit = async (o) => {
    if (customers.length === 0) {
      const res = await customerAPI.getAll({ limit: 100 });
      setCustomers(res.data.data);
    }
    setForm({
      customerId: o.customerId?._id || o.customerId,
      amount: o.amount,
      category: o.category,
      orderDate: new Date(o.orderDate).toISOString().split('T')[0]
    });
    setDialog({ open: true, mode: 'edit', data: o });
  };

  const handleSave = async () => {
    if (!form.customerId || !form.amount || !form.category) return enqueueSnackbar('All fields required', { variant: 'warning' });
    setSaving(true);
    try {
      if (dialog.mode === 'create') {
        await orderAPI.create(form);
        enqueueSnackbar('Order created!', { variant: 'success' });
      } else {
        await orderAPI.update(dialog.data._id, form);
        enqueueSnackbar('Order updated!', { variant: 'success' });
      }
      setDialog({ open: false });
      fetchOrders();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await orderAPI.delete(id);
      enqueueSnackbar('Order deleted', { variant: 'success' });
      setDeleteConfirm(null);
      fetchOrders();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="Orders" subtitle={`${pagination.total} total orders`} action="Add Order" actionIcon={<AddRounded />} onAction={openCreate} />
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search orders…" value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 0 })); }}
              size="small" sx={{ flex: 1, minWidth: 200 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={filterCat} label="Category" onChange={e => setFilterCat(e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>{Array(5).fill(0).map((_, j) => (
                    <TableCell key={j}><Box sx={{ height: 14, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>
                  ))}</TableRow>
                )) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>
                    <EmptyState icon={<ShoppingCartRounded sx={{ fontSize: 28 }} />} title="No orders found"
                      description="Add your first order or adjust the filters." action="Add Order" onAction={openCreate} />
                  </TableCell></TableRow>
                ) : orders.map(o => (
                  <TableRow key={o._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{o.customerId?.name || 'Unknown'}</Typography>
                      <Typography variant="caption" color="text.secondary">{o.customerId?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={o.category} size="small"
                        sx={{ bgcolor: `${CAT_COLORS[o.category] || '#9CA3AF'}18`, color: CAT_COLORS[o.category] || '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(o.amount)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{formatDate(o.orderDate)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(o)}><EditRounded fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(o)}><DeleteRounded fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={pagination.total} page={pagination.page}
            onPageChange={(_, p) => setPagination(prev => ({ ...prev, page: p }))}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={e => setPagination(prev => ({ ...prev, limit: +e.target.value, page: 0 }))}
            rowsPerPageOptions={[5, 10, 25, 50]} />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{dialog.mode === 'create' ? 'Add Order' : 'Edit Order'}</Typography>
          <IconButton size="small" onClick={() => setDialog({ open: false })}><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer *</InputLabel>
                <Select value={form.customerId} label="Customer *" onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}>
                  {customers.map(c => <MenuItem key={c._id} value={c._id}>{c.name} — {c.email}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} fullWidth size="small" required />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Order Date" type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {dialog.mode === 'create' ? 'Create Order' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Order?</DialogTitle>
        <DialogContent><Typography>Delete this <strong>{formatCurrency(deleteConfirm?.amount)}</strong> order from <strong>{deleteConfirm?.customerId?.name}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm?._id)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
