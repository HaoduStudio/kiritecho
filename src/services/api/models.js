import { apiClient } from './apiClient'

export const listModels = () => apiClient.get('/models')
