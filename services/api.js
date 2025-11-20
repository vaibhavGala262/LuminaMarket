const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
export const getAuthToken = () => localStorage.getItem('lumina_auth_token');
export const setAuthToken = (token) => localStorage.setItem('lumina_auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('lumina_auth_token');

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


// Product API
export const productAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiCall(`/products/${id}`),

  create: (product) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  }),

  update: (id, product) => apiCall(`/ products / ${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  }),

  delete: (id) => apiCall(`/ products / ${id} `, {
    method: 'DELETE'
  }),

  getCategories: () => apiCall('/products/categories')
};

// Cart API - now uses authenticated endpoints
export const cartAPI = {
  get: () => apiCall('/cart'),

  addItem: (productId, quantity = 1) => apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),

  updateItem: (productId, quantity) => apiCall(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),

  removeItem: (productId) => apiCall(`/cart/${productId}`, {
    method: 'DELETE'
  }),

  clear: () => apiCall('/cart', {
    method: 'DELETE'
  }),

  checkout: () => apiCall('/cart/checkout', {
    method: 'POST'
  })
};

// Search API
export const searchAPI = {
  aiSearch: (query) => apiCall('/search/ai', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),

  textSearch: (query) => apiCall(`/ search / text ? query = ${encodeURIComponent(query)} `)
};

// Auth API
export const authAPI = {
  register: (username, email, password) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  }),

  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  getProfile: () => apiCall('/auth/profile'),

  logout: () => apiCall('/auth/logout', {
    method: 'POST'
  })
};

// Order API
export const orderAPI = {
  getUserOrders: () => apiCall('/orders')
};

// Generate or get session ID (kept for compatibility but not used for auth)
export const getSessionId = () => {
  let sessionId = localStorage.getItem('lumina_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)} `;
    localStorage.setItem('lumina_session_id', sessionId);
  }
  return sessionId;
};
