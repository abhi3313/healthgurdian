import api from './api'

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/mark-all/read'),
  
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}
