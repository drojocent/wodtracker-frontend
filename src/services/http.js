import { createApiClient } from './apiClient'

const userServiceApiUrl =
  import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081/api'
const wodServiceApiUrl =
  import.meta.env.VITE_WOD_SERVICE_URL || 'http://localhost:8081'

export const userApiClient = createApiClient(userServiceApiUrl)
export const wodApiClient = createApiClient(wodServiceApiUrl)
