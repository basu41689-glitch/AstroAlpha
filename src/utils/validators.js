// Utility Functions - Validators
// Form validation, data validation, etc.

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateStockSymbol = (symbol) => {
  return /^[A-Z0-9&\-]{1,10}$/.test(symbol);
};

export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validatePortfolioHolding = (holding) => {
  return (
    holding.symbol &&
    validateNumber(holding.quantity, 0.01) &&
    validateNumber(holding.currentPrice, 0) &&
    validateNumber(holding.avgPrice, 0)
  );
};

export const validateAlertRule = (rule) => {
  return (
    rule.symbol &&
    rule.type &&
    (rule.type === 'price' ? validateNumber(rule.value, 0) : true)
  );
};

// basic HTML sanitizer example (strips tags, not for rich text)
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]+>/g, '');
};
