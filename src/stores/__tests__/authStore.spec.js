import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const loginMock = vi.fn()
const registerMock = vi.fn()
const clearAuthDataMock = vi.fn()
const getStoredAuthMock = vi.fn()
const setAuthDataMock = vi.fn()

vi.mock('@/services/authService', () => ({
  default: {
    login: loginMock,
    register: registerMock,
  },
}))

vi.mock('@/utils/auth', () => ({
  clearAuthData: clearAuthDataMock,
  getStoredAuth: getStoredAuthMock,
  setAuthData: setAuthDataMock,
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.atob = vi.fn((value) => Buffer.from(value, 'base64').toString('binary'))
  })

  it('hydrates auth and extracts the role from the token when needed', async () => {
    const payload = Buffer.from(JSON.stringify({ roles: ['ADMIN'] })).toString('base64url')
    getStoredAuthMock.mockReturnValue({
      token: `header.${payload}.sig`,
      role: '',
      user: { name: 'Dani' },
    })

    const { useAuthStore } = await import('@/stores/authStore')
    const store = useAuthStore()

    store.hydrateAuth()

    expect(store.isAuthenticated).toBe(true)
    expect(store.role).toBe('ADMIN')
    expect(store.displayName).toBe('Dani')
  })

  it('logs in, persists auth and logs out', async () => {
    loginMock.mockResolvedValue({
      accessToken: 'jwt',
      user: { id: 1, name: 'Dani', role: 'USER' },
    })
    const { useAuthStore } = await import('@/stores/authStore')
    const store = useAuthStore()

    await expect(store.login({ email: 'a', password: 'b' })).resolves.toMatchObject({
      token: 'jwt',
      role: 'USER',
    })
    expect(setAuthDataMock).toHaveBeenCalled()

    await expect(store.register({})).resolves.toBeUndefined()
    store.logout()
    expect(clearAuthDataMock).toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(false)
  })
})
