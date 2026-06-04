import { apiClient } from './apiClient'

export const syncFiles = (files) =>
  apiClient.post('/files/sync', { files })
