import { apiClient } from './apiClient'

export const listConversations = (page = 1, pageSize = 20) =>
  apiClient.get(`/conversations?page=${page}&page_size=${pageSize}`)

export const createConversation = (title) =>
  apiClient.post('/conversations', { title })

export const fetchConversation = (id) =>
  apiClient.get(`/conversations/${id}`)

export const deleteConversation = (id) =>
  apiClient.delete(`/conversations/${id}`)

export const chatCompletions = (params, onEvent) => {
  if (params.stream) {
    return apiClient.stream('/chat/completions', params, onEvent)
  }

  return apiClient.post('/chat/completions', params)
}
