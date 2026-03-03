// Simple logger for frontend code.  
// In production we silence debug/info logs; errors always print.

const isDev = import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'development';

function debug(...args) {
  if (isDev) {
    console.debug('[DEBUG]', ...args);
  }
}

function info(...args) {
  if (isDev) {
    console.info('[INFO]', ...args);
  }
}

function warn(...args) {
  console.warn('[WARN]', ...args);
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

export default {
  debug,
  info,
  warn,
  error,
};
