import { apiClient } from './apiClient'

export const listConversations = (page = 1, pageSize = 20) =>
  apiClient.get(`/conversations?page=${page}&page_size=${pageSize}`)

export const createConversation = (title) =>
  apiClient.post('/conversations', { title })

export const fetchConversation = (id) =>
  apiClient.get(`/conversations/${id}`)

export const updateConversation = (id, title) =>
  apiClient.patch(`/conversations/${id}`, { title })

export const deleteConversation = (id) =>
  apiClient.delete(`/conversations/${id}`)

export const listMessages = (conversationId, { page = 1, pageSize = 50, order = 'asc', format } = {}) => {
  const params = new URLSearchParams({ page, page_size: pageSize, order })

  if (format) {
    params.set('format', format)
  }

  return apiClient.get(`/conversations/${conversationId}/messages?${params}`)
}

export const chatCompletions = (params, onEvent, onMeta) => {
  if (params.stream) {
    return apiClient.stream('/chat/completions', params, onEvent, onMeta)
  }

  return apiClient.post('/chat/completions', params)
}

export const chatMessages = (params, onEvent, onMeta) => {
  if (params.stream !== false) {
    return apiClient.streamSSE('/chat/messages', params, onEvent, onMeta)
  }

  return apiClient.post('/chat/messages', params)
}
