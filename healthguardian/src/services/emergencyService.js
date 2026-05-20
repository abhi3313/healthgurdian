import api from './api'

export const emergencyService = {
  getEmergencyProfile: (patientId) => api.get(`/emergency/${encodeURIComponent(patientId)}`, { silent: true }),
}

export const getEmergencyProfile = emergencyService.getEmergencyProfile
