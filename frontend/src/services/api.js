import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/changepassword', data),
  logout: () => API.get('/auth/logout'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  getOne: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getAnalytics: (params) => API.get('/transactions/analytics', { params }),
};

// Budget APIs
export const budgetAPI = {
  getAll: (params) => API.get('/budgets', { params }),
  getOne: (id) => API.get(`/budgets/${id}`),
  create: (data) => API.post('/budgets', data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`),
  getAnalytics: () => API.get('/budgets/analytics'),
};

// Investment APIs
export const investmentAPI = {
  getAll: (params) => API.get('/investments', { params }),
  getOne: (id) => API.get(`/investments/${id}`),
  create: (data) => API.post('/investments', data),
  update: (id, data) => API.put(`/investments/${id}`, data),
  delete: (id) => API.delete(`/investments/${id}`),
  updateValue: (id, data) => API.put(`/investments/${id}/value`, data),
  getPortfolio: () => API.get('/investments/portfolio'),
  getAnalytics: () => API.get('/investments/analytics'),
};

export default API;
