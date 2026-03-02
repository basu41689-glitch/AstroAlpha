// Utility Functions - Formatters
// Price formatting, date formatting, etc.

export const formatPrice = (value, currency = '₹') => {
  if (!value && value !== 0) return '-';
  return `${currency}${parseFloat(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatPercent = (value, decimals = 2) => {
  if (!value && value !== 0) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${parseFloat(value).toFixed(decimals)}%`;
};

export const formatNumber = (value, decimals = 2) => {
  if (!value && value !== 0) return '-';
  return parseFloat(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'DD MMM YYYY') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${year}`;
  }
  return d.toLocaleDateString();
};

export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatMarketCap = (value) => {
  if (!value) return '-';
  if (value >= 1e9) return `₹${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `₹${(value / 1e6).toFixed(1)}M`;
  return `₹${(value / 1e3).toFixed(1)}K`;
};
