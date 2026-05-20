import { aiService } from './aiService'
import { conversationService } from './conversationService'

export const chatService = {
  createConversation: conversationService.createConversation,
  deleteConversation: conversationService.deleteConversation,
  getConversations:  conversationService.getConversations,
  getMessages:       conversationService.loadConversation,
  loadConversation:  conversationService.loadConversation,
  saveMessage:       (message, history, sessionId) => aiService.query(message, history, sessionId),
}

export const createConversation = chatService.createConversation
export const deleteConversation = chatService.deleteConversation
export const getConversations = chatService.getConversations
export const getMessages = chatService.getMessages
export const loadConversation = chatService.loadConversation
export const saveMessage = chatService.saveMessage
