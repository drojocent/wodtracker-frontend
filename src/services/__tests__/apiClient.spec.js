import { describe, expect, it, vi } from 'vitest'

const createMockClient = () => {
  const requestHandlers = []
  const responseRejectedHandlers = []

  return {
    defaults: {},
    interceptors: {
      request: {
        use(fn) {
          requestHandlers.push(fn)
        },
      },
      response: {
        use(_success, error) {
          responseRejectedHandlers.push(error)
        },
      },
    },
    __requestHandlers: requestHandlers,
    __responseRejectedHandlers: responseRejectedHandlers,
  }
}

const axiosCreateMock = vi.fn(() => createMockClient())
const getStoredTokenMock = vi.fn()
const notifyUnauthorizedMock = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: axiosCreateMock,
  },
}))

vi.mock('@/utils/auth', () => ({
  getStoredToken: getStoredTokenMock,
  notifyUnauthorized: notifyUnauthorizedMock,
}))

describe('apiClient', () => {
  it('adds the bearer token to outgoing requests', async () => {
    getStoredTokenMock.mockReturnValue('jwt-token')
    const { createApiClient } = await import('@/services/apiClient')
    const client = createApiClient('http://localhost:8080')

    const config = await client.__requestHandlers[0]({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer jwt-token')
  })

  it('normalizes 401 errors and notifies unauthorized state', async () => {
    const { createApiClient } = await import('@/services/apiClient')
    const client = createApiClient('http://localhost:8080')
    const errorHandler = client.__responseRejectedHandlers[0]

    await expect(
      errorHandler({
        response: {
          status: 401,
          data: {},
        },
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
    })

    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1)
  })

  it('normalizes generic API messages', async () => {
    const { createApiClient } = await import('@/services/apiClient')
    const client = createApiClient('http://localhost:8080')
    const errorHandler = client.__responseRejectedHandlers[0]

    await expect(
      errorHandler({
        response: {
          status: 403,
          data: {
            message: 'Prohibido',
          },
        },
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: 'Prohibido',
    })
  })
})
