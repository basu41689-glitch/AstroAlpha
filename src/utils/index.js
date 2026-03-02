// Utility functions for the application

/**
 * Creates a page URL from page name
 * @param {string} pageName - Name of the page (e.g., 'Dashboard', 'Portfolio')
 * @returns {string} - URL path for the page
 */
export const createPageUrl = (pageName) => {
  if (!pageName) return '/';
  // Convert pageName to lowercase and add leading slash
  return `/${pageName.toLowerCase()}`;
};

/**
 * Handles API errors
 * @param {Error} error - The error object
 * @returns {string} - Error message
 */
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An error occurred';
};

/**
 * Formats currency values
 * @param {number} value - The value to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = '₹') => {
  if (!value && value !== 0) return '-';
  return `${currency}${parseFloat(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default createPageUrl;
