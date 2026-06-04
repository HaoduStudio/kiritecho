import { apiClient } from './apiClient'

export const syncMemories = (memories) =>
  apiClient.post('/memories/sync', { memories })
