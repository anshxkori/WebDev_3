const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    signup: (userData) =>
      apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getMe: () => apiRequest('/auth/me'),
  },
  notes: {
    getAll: () => apiRequest('/notes'),
    getById: (id) => apiRequest(`/notes/${id}`),
    create: (noteData) =>
      apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),
    update: (id, noteData) =>
      apiRequest(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      }),
    delete: (id) =>
      apiRequest(`/notes/${id}`, {
        method: 'DELETE',
      }),
  },
  events: {
    getRecent: () => apiRequest('/events'),
  },
  stats: {
    get: () => apiRequest('/stats'),
    health: () => apiRequest('/health'),
  },
};
