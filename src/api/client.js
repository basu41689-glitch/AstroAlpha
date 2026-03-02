// central API client for the frontend
// handles base URL, headers, and error parsing

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const url = baseUrl + path;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error('API request failed');
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

export const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) =>
    request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};
