// Utility Functions - Helpers
// Common helper functions

export const calculateReturns = (currentValue, investedValue) => {
  if (!investedValue) return 0;
  return ((currentValue - investedValue) / investedValue) * 100;
};

export const calculatePnL = (currentValue, investedValue) => {
  return currentValue - investedValue;
};

export const sortPortfolio = (holdings, sortBy = 'value', order = 'desc') => {
  const sorted = [...holdings].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'value':
        aVal = a.quantity * a.currentPrice;
        bVal = b.quantity * b.currentPrice;
        break;
      case 'gain':
        aVal = (a.currentPrice - a.avgPrice) * a.quantity;
        bVal = (b.currentPrice - b.avgPrice) * b.quantity;
        break;
      case 'return':
        aVal = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
        bVal = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
        break;
      default:
        return 0;
    }
    
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });
  
  return sorted;
};

export const getColorForValue = (value, positive = '#10b981', negative = '#ef4444', neutral = '#94a3b8') => {
  if (!value && value !== 0) return neutral;
  return value > 0 ? positive : value < 0 ? negative : neutral;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
