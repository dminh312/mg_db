// API Configuration
import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Still send cookies for backward compatibility
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage if available
    const token = localStorage.getItem('token')
    if (token && token !== 'session') {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      hasToken: !!config.headers.Authorization
    })
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    })

    // If 401 and we have a token, it might be expired - clear it
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      if (token && token !== 'session') {
        console.log('🔄 Token might be expired, clearing...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Optionally redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default API_BASE_URL
