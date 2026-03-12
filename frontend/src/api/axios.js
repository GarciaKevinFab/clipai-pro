import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          })
          const { access, refresh } = response.data
          useAuthStore.getState().setTokens(access, refresh)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch {
          useAuthStore.getState().logout()
          window.location.href = '/signin'
        }
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/signin'
      }
    }

    return Promise.reject(error)
  }
)

export default api
