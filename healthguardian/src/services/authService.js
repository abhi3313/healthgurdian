import api from './api'

export const authService = {
  updateProfile(payload) {
    return api.put('/auth/me', payload)
  },
  changePassword(payload) {
    return api.put('/auth/change-password', payload)
  },
  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },
  resetPassword(token, payload) {
    return api.put(`/auth/reset-password/${token}`, payload)
  },
}

export async function sendOtp(email, purpose) {
  const { data } = await api.post('/auth/otp/send', { email, purpose })
  return data
}

export async function loginWithOtp(email, code) {
  const { data } = await api.post('/auth/otp/login', { email, code })
  return data
}

export async function loginWithGoogleIdToken(idToken) {
  const { data } = await api.post('/auth/google', { idToken })
  return data
}

export async function forgotPassword(email) {
  const { data } = await authService.forgotPassword(email)
  return data
}

export async function resetPassword(token, payload) {
  const { data } = await authService.resetPassword(token, payload)
  return data
}
