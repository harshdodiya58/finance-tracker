// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date for input
export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'on-track': 'success',
    'warning': 'warning',
    'exceeded': 'danger',
    'pending': 'warning',
    'settled': 'success',
    'profit': 'success',
    'loss': 'danger',
    'neutral': 'info',
  };
  return colors[status] || 'info';
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
