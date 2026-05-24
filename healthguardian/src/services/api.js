import axios from 'axios'
import toast from 'react-hot-toast'

/** Unwrap `{ success, message, data }` from successful API JSON bodies for React Query. */
export function unwrapData(res) {
  const body = res?.data
  if (body && typeof body === 'object' && body.success === true && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body
}

function getApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_BASE_URL || '/api').trim()
  if (!raw || raw === '/') return '/api'

  const withoutTrailingSlash = raw.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`
  }

  return withoutTrailingSlash
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})


// Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const isNetworkError = !error.response && error.message === 'Network Error'
    const message = isNetworkError
      ? 'Cannot reach the backend API. Check the deployed API URL and backend CORS settings.'
      : error.response?.data?.message || error.message || 'Something went wrong'

    const silent = error.config?.silent

    if (status === 401) {
      localStorage.removeItem('hg_token')
      localStorage.removeItem('hg_user')
      delete api.defaults.headers.common['Authorization']
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
    } else if (!silent && status !== 422 && status !== 409) {
      toast.error(message)
    }
    return Promise.reject(error)
  }
)

export default api
