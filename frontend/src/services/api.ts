import axios from 'axios';

// API Base URL - uses env variable or falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:4000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach auth token ──────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('estatemanagement_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-logout on 401 ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('estatemanagement_token');
      // Optionally redirect to login
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// API Endpoints — aligned with backend routes
// ═══════════════════════════════════════════════════════════

// User Authentication
// Backend register expects { name, email, password }
// We transform fullName → name here so the UI can keep using fullName
export const userAPI = {
  register: (data: { fullName: string; email: string; phone: string; password: string; role?: string }) =>
    apiClient.post('/users/register', {
      name: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role || 'buyer',
    }),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/users/login', data),

  forgotPassword: (email: string) =>
    apiClient.post('/users/forgot', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post(`/users/reset/${token}`, { password }),

  verifyEmail: (token: string) =>
    apiClient.get(`/users/verify/${token}`),

  getProfile: () =>
    apiClient.get('/users/me'),

  getFavorites: () =>
    apiClient.get('/users/favorites'),

  saveFavorite: (propertyId: string) =>
    apiClient.post(`/users/favorites/${propertyId}`),

  removeFavorite: (propertyId: string) =>
    apiClient.delete(`/users/favorites/${propertyId}`),
};

// Properties (CRUD — admin-managed listings)
export const propertiesAPI = {
  getAll: () =>
    apiClient.get('/products/list'),

  getById: (id: string) =>
    apiClient.get(`/products/single/${id}`),
};

// User-submitted property listings (require auth)
export const userListingsAPI = {
  create: (formData: FormData) =>
    apiClient.post('/user/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyListings: () =>
    apiClient.get('/user/properties'),

  update: (id: string, formData: FormData) =>
    apiClient.put(`/user/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    apiClient.delete(`/user/properties/${id}`),
};

// Appointments (supports guest + auth bookings)
export const appointmentsAPI = {
  schedule: (data: {
    propertyId: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) =>
    apiClient.post('/appointments/schedule', data),

  getByUser: () =>
    apiClient.get('/appointments/user'),

  getBySeller: () =>
    apiClient.get('/appointments/seller'),

  updateStatus: (appointmentId: string, status: string) =>
    apiClient.put('/appointments/seller/status', { appointmentId, status }),

  cancel: (id: string, reason?: string) =>
    apiClient.put(`/appointments/cancel/${id}`, { cancelReason: reason }),
};

export const aiAPI = {
  search: (params: {
    city: string;
    locality: string;
    bhk: string;
    possession: string;
    price: { min: number; max: number };
    type: string;
    category: string;
  }) =>
    apiClient.post(
      '/properties/search',
      {
        city: params.city,
        locality: params.locality,
        bhk: params.bhk,
        possession: params.possession,
        minPrice: String(params.price.min / 10_000_000),
        maxPrice: String(params.price.max / 10_000_000),
        propertyType: params.type,
        propertyCategory: params.category,
        limit: 6,
      },
      {
        headers: {
          'X-Github-Key': apiKeyStorage.getGithubKey(),
          'X-Firecrawl-Key': apiKeyStorage.getFirecrawlKey(),
        },
      }
    ),

  locationTrends: (city: string) =>
    apiClient.get(`/properties/trends/${encodeURIComponent(city)}`, {
      headers: {
        'X-Github-Key': apiKeyStorage.getGithubKey(),
        'X-Firecrawl-Key': apiKeyStorage.getFirecrawlKey(),
      },
    }),

  validateKeys: (keys: { githubKey: string; firecrawlKey: string }) =>
    apiClient.post(
      '/properties/validate-keys',
      {},
      {
        headers: {
          'X-Github-Key': keys.githubKey,
          'X-Firecrawl-Key': keys.firecrawlKey,
        },
      }
    ),
};

// Helpers to read/write user API keys in localStorage
export const apiKeyStorage = {
  getGithubKey:    ()    => localStorage.getItem('estatemanagement_github_key') || '',
  getFirecrawlKey: ()    => localStorage.getItem('estatemanagement_firecrawl_key') || '',
  setGithubKey:    (key: string) => localStorage.setItem('estatemanagement_github_key', key),
  setFirecrawlKey: (key: string) => localStorage.setItem('estatemanagement_firecrawl_key', key),
  hasKeys: () => !!(localStorage.getItem('estatemanagement_github_key') && localStorage.getItem('estatemanagement_firecrawl_key')),
  clear: () => {
    localStorage.removeItem('estatemanagement_github_key');
    localStorage.removeItem('estatemanagement_firecrawl_key');
  },
};

// Contact Form
export const contactAPI = {
  submit: (data: { name: string; email: string; phone: string; message: string }) =>
    apiClient.post('/forms/submit', data),
};

export default apiClient;

