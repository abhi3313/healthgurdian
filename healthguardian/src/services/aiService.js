import api from './api'

export const aiService = {
  query:       (message, history) => api.post('/ai/query',    { message, history }),
  getSessions: ()                  => api.get('/ai/sessions'),
  getSession:  (id)                => api.get(`/ai/sessions/${id}`),
  deleteSession:(id)               => api.delete(`/ai/sessions/${id}`),
  analyze:     (data)              => api.post('/ai/analyze', data),
}
