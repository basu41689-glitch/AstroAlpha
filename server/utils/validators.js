// Backend Utilities - Validators
// Server-side validation

export const validatePortfolioData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Portfolio name is required');
  }
  
  if (!Array.isArray(data.holdings)) {
    errors.push('Holdings must be an array');
  }
  
  data.holdings?.forEach((holding, index) => {
    if (!holding.symbol) errors.push(`Holding ${index}: Symbol is required`);
    if (!holding.quantity || holding.quantity <= 0) errors.push(`Holding ${index}: Invalid quantity`);
    if (!holding.currentPrice || holding.currentPrice <= 0) errors.push(`Holding ${index}: Invalid price`);
  });
  
  return { valid: errors.length === 0, errors };
};

export const validateAlertData = (data) => {
  const errors = [];
  
  if (!data.symbol) errors.push('Stock symbol is required');
  if (!data.type) errors.push('Alert type is required');
  if (!['price', 'volume', 'pattern'].includes(data.type)) {
    errors.push('Invalid alert type');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateAnalysisRequest = (data) => {
  const errors = [];
  
  if (!data.holdings || !Array.isArray(data.holdings) || data.holdings.length === 0) {
    errors.push('At least one holding is required');
  }
  
  return { valid: errors.length === 0, errors };
};
