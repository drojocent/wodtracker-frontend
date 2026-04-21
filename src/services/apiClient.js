import axios from 'axios'
import { getStoredToken, notifyUnauthorized } from '@/utils/auth'

export function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use((config) => {
    const token = getStoredToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const isLoginRequest = error?.config?.url?.includes('/auth/login')

      if (error?.response?.status === 401 && !isLoginRequest) {
        notifyUnauthorized()
      }

      return Promise.reject(normalizeApiError(error))
    },
  )

  return client
}

function normalizeApiError(error) {
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (error?.response?.status === 401 ? 'Tu sesión ha expirado. Inicia sesión de nuevo.' : '') ||
    (error?.response?.status === 403 ? 'No tienes permisos para realizar esta acción.' : '') ||
    error?.message ||
    'Ha ocurrido un error inesperado.'

  return {
    ...error,
    message: apiMessage,
    status: error?.response?.status || 500,
    data: error?.response?.data || null,
  }
}
