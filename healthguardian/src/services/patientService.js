import api from './api'

export const patientService = {
  // Dashboard
  getDashboard:   ()          => api.get('/patient/dashboard'),
  getStats:       ()          => api.get('/patient/stats'),

  // Health Records
  getRecords:     (params)    => api.get('/patient/records', { params }),
  getRecord:      (id)        => api.get(`/patient/records/${id}`),
  addRecord:      (data)      => api.post('/patient/records', data),
  updateRecord:   (id, data)  => api.put(`/patient/records/${id}`, data),
  deleteRecord:   (id)        => api.delete(`/patient/records/${id}`),

  // Reports
  uploadReport:   (formData)  => api.post('/patient/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getReports:     ()          => api.get('/patient/reports'),
  deleteReport:   (id)        => api.delete(`/patient/reports/${id}`),

  // Doctors (for booking)
  getDoctors: (params)       => api.get('/patient/doctors', { params }),

  // Appointments
  getAppointments: ()         => api.get('/patient/appointments'),
  bookAppointment: (data)     => api.post('/patient/appointments', data),
  cancelAppointment: (id, data = {}) => api.delete(`/patient/appointments/${id}`, { data }),

  // Vitals
  getVitals:      (range)     => api.get('/patient/vitals', { params: { range } }),
  addVital:       (data)      => api.post('/patient/vitals', data),

  // Prescriptions
  getPrescriptions: ()        => api.get('/patient/prescriptions'),
}
