import { apiClient } from './apiClient'

export const listPlans = () => apiClient.get('/plans')

export const subscribe = (planId) => apiClient.post('/subscribe', { plan_id: planId })

export const redeem = (code) => apiClient.post('/redeem', { code })
