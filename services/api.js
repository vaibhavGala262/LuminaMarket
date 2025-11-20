const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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
  
  update: (id, product) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  }),
  
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE'
  }),
  
  getCategories: () => apiCall('/products/categories')
};

// Cart API
export const cartAPI = {
  get: (sessionId) => apiCall(`/cart/${sessionId}`),
  
  addItem: (sessionId, productId, quantity = 1) => apiCall(`/cart/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  
  updateItem: (sessionId, productId, quantity) => apiCall(`/cart/${sessionId}/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeItem: (sessionId, productId) => apiCall(`/cart/${sessionId}/${productId}`, {
    method: 'DELETE'
  }),
  
  clear: (sessionId) => apiCall(`/cart/${sessionId}`, {
    method: 'DELETE'
  })
};

// Search API
export const searchAPI = {
  aiSearch: (query) => apiCall('/search/ai', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),
  
  textSearch: (query) => apiCall(`/search/text?query=${encodeURIComponent(query)}`)
};

// Generate or get session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('lumina_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('lumina_session_id', sessionId);
  }
  return sessionId;
};

