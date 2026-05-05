import api from './api'

export const adminService = {
  getStats:        ()          => api.get('/admin/stats'),
  getUsers:        (params)    => api.get('/admin/users', { params }),
  getUser:         (id)        => api.get(`/admin/users/${id}`),
  createUser:      (data)      => api.post('/admin/users', data),
  updateUser:      (id, data)  => api.put(`/admin/users/${id}`, data),
  deleteUser:      (id)        => api.delete(`/admin/users/${id}`),
  toggleUserStatus:(id)        => api.patch(`/admin/users/${id}/toggle-status`),
  /** Pass isApproved as the string 'true' | 'false' so GET query always includes the flag (axios omits boolean false). */
  getDoctors:      (params)    => api.get('/admin/doctors', {
    params: params && typeof params.isApproved === 'boolean'
      ? { ...params, isApproved: params.isApproved ? 'true' : 'false' }
      : params,
  }),
  approveDoctor:   (id, approve = true) => api.patch(`/admin/doctors/${id}/approve`, { approve }),
  getPatients:     ()          => api.get('/admin/patients'),
  getAuditLogs:    (params)    => api.get('/admin/logs', { params }),
  getSystemHealth: ()          => api.get('/admin/system-health'),
}
