export function formatCurrency(value) {
  if (!value && value !== 0) return '₹0';
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatNumber(value) {
  if (!value && value !== 0) return '0';
  return value.toLocaleString('en-IN');
}

export function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 30) return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const CATEGORIES = ['Shoes', 'Socks', 'Clothing', 'Electronics', 'Accessories', 'Sports', 'Home', 'Books', 'Beauty', 'Other'];
export const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push', 'In-App'];
export const CAMPAIGN_STATUSES = ['Draft', 'Active', 'Completed', 'Paused', 'Failed'];

export const STATUS_COLORS = {
  Draft: '#9CA3AF', Active: '#22C55E', Completed: '#3B82F6',
  Paused: '#F59E0B', Failed: '#EF4444',
  Sent: '#6B7280', Delivered: '#3B82F6', Opened: '#9B59FF', Clicked: '#22C55E'
};
