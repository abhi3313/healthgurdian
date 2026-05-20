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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
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
    const message = error.response?.data?.message || error.message || 'Something went wrong'

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
