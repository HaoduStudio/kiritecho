import { apiClient } from './apiClient'

export const semanticSearch = (query, limit = 10) =>
  apiClient.post('/search', { query, limit })
