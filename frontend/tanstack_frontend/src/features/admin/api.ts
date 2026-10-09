import type { AxiosRequestConfig } from 'axios'
import { getImagineBorneoToursAPI } from '@/api/generated'

export const adminApi = getImagineBorneoToursAPI()

export function adminOptions(token: string): AxiosRequestConfig {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const response = (error as { response?: { data?: { detail?: string } } }).response
  return response?.data?.detail || fallback
}
