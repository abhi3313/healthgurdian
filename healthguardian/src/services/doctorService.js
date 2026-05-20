import api from './api'

export const doctorService = {
  getDashboard:      ()         => api.get('/doctor/dashboard'),
  getPatients:       (params)   => api.get('/doctor/patients', { params }),
  getPatient:        (id)       => api.get(`/doctor/patients/${id}`),
  getPatientRecords: (id)       => api.get(`/doctor/patients/${id}/records`),
  getPatientReports: (id)       => api.get(`/doctor/patients/${id}/reports`),
  addPatientRecord:  (id, data) => api.post(`/doctor/patients/${id}/records`, data),
  uploadPatientReport: (id, formData) => api.post(`/doctor/patients/${id}/reports/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  addNote:           (id, data) => api.post(`/doctor/patients/${id}/notes`, data),
  getAppointments:   ()         => api.get('/doctor/appointments'),
  updateAppointment: (id, data) => api.put(`/doctor/appointments/${id}`, data),
  getPrescriptions:  (id)       => api.get(`/doctor/patients/${id}/prescriptions`),
  addPrescription:   (id, data) => api.post(`/doctor/patients/${id}/prescriptions`, data),
  getStats:          ()         => api.get('/doctor/stats'),
}
