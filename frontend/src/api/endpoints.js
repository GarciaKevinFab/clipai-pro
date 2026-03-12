import api from './axios'

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  refresh: (data) => api.post('/api/auth/refresh/', data),
  logout: (data) => api.post('/api/auth/logout/', data),
  me: () => api.get('/api/auth/me/'),
  updateMe: (data) => api.patch('/api/auth/me/', data),
  changePassword: (data) => api.post('/api/auth/change-password/', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/api/auth/reset-password/', data),
}

// Videos
export const videosAPI = {
  list: (params) => api.get('/api/videos/', { params }),
  generate: (data) => api.post('/api/videos/generate/', data),
  detail: (id) => api.get(`/api/videos/${id}/`),
  status: (id) => api.get(`/api/videos/${id}/status/`),
  delete: (id) => api.delete(`/api/videos/${id}/`),
  publish: (id, data) => api.post(`/api/videos/${id}/publish/`, data),
}

// Catalog
export const catalogAPI = {
  styles: () => api.get('/api/catalog/styles/'),
  voices: (params) => api.get('/api/catalog/voices/', { params }),
  music: (params) => api.get('/api/catalog/music/', { params }),
  plans: () => api.get('/api/catalog/plans/'),
}

// Payments
export const paymentsAPI = {
  createCharge: (data) => api.post('/api/payments/create-charge/', data),
  history: (params) => api.get('/api/payments/history/', { params }),
  subscription: () => api.get('/api/payments/subscription/'),
  cancel: () => api.post('/api/payments/cancel/'),
}

// Social
export const socialAPI = {
  accounts: () => api.get('/api/social/accounts/'),
  tiktokStart: () => api.get('/api/social/oauth/tiktok/start/'),
  youtubeStart: () => api.get('/api/social/oauth/youtube/start/'),
  instagramStart: () => api.get('/api/social/oauth/instagram/start/'),
  disconnect: (id) => api.delete(`/api/social/accounts/${id}/`),
}

// Affiliates
export const affiliatesAPI = {
  profile: () => api.get('/api/affiliates/profile/'),
  activate: () => api.post('/api/affiliates/activate/'),
  referrals: (params) => api.get('/api/affiliates/referrals/', { params }),
  earnings: () => api.get('/api/affiliates/earnings/'),
  link: () => api.get('/api/affiliates/link/'),
}
