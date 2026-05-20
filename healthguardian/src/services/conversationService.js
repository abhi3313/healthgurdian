import api from './api'

export const conversationService = {
  createConversation: (title = '') => api.post('/ai/conversations', { title }),
  deleteConversation: (sessionId) => api.delete(`/ai/conversations/${sessionId}`),
  getConversations:  () => api.get('/ai/conversations'),
  loadConversation:  (sessionId) => api.get(`/ai/conversations/${sessionId}`),
}

export const createConversation = conversationService.createConversation
export const deleteConversation = conversationService.deleteConversation
export const getConversations = conversationService.getConversations
export const loadConversation = conversationService.loadConversation
