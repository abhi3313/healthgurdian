import api from './api'

export const accessService = {
  // ── Patient endpoints ───────────────────────────────────
  getMyPatientId:     ()           => api.get('/access/patient-id'),
  getIncomingRequests:(params)     => api.get('/access/incoming', { params }),
  getMyDoctors:       ()           => api.get('/access/my-doctors'),
  approveRequest:     (id, data)   => api.patch(`/access/requests/${id}/approve`, data),
  rejectRequest:      (id, data)   => api.patch(`/access/requests/${id}/reject`, data),
  revokeAccess:       (id, data)   => api.patch(`/access/requests/${id}/revoke`, data),

  // ── Doctor endpoints ────────────────────────────────────
  requestAccess:       (data)      => api.post('/access/request', data),
  getMyRequests:       (params)    => api.get('/access/my-requests', { params }),
  getApprovedPatients: ()          => api.get('/access/approved-patients'),
  withdrawRequest:     (id)        => api.delete(`/access/requests/${id}`),
  checkAccess:         (patientId) => api.get(`/access/check/${patientId}`),
  getApprovedPatientData: (patientId) => api.get(`/access/patients/${patientId}/data`),
}
