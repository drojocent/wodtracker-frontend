import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadRouterWithAuth(overrides = {}) {
  vi.resetModules()

  const authStoreMock = {
    isHydrated: true,
    isAuthenticated: false,
    role: '',
    hydrateAuth: vi.fn(),
    ...overrides,
  }

  vi.doMock('@/stores/authStore', () => ({
    useAuthStore: () => authStoreMock,
  }))

  const router = (await import('@/router/index.js')).default

  return { router, authStoreMock }
}

afterEach(() => {
  vi.clearAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('router guards', () => {
  it('hydrates auth before resolving navigation', async () => {
    const { router, authStoreMock } = await loadRouterWithAuth({
      isHydrated: false,
    })

    await router.push('/login')
    await router.isReady()

    expect(authStoreMock.hydrateAuth).toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects authenticated users away from public routes', async () => {
    const { router } = await loadRouterWithAuth({
      isAuthenticated: true,
      role: 'USER',
    })

    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('redirects unauthenticated users to login and preserves redirect query', async () => {
    const { router } = await loadRouterWithAuth({
      isAuthenticated: false,
    })

    await router.push('/profile')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile')
  })

  it('redirects users without the required role back to home', async () => {
    const { router } = await loadRouterWithAuth({
      isAuthenticated: true,
      role: 'USER',
    })

    await router.push('/admin/wods')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('allows authorized access to benchmark detail routes', async () => {
    const { router } = await loadRouterWithAuth({
      isAuthenticated: true,
      role: 'ADMIN',
    })

    await router.push('/benchmarks/12')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('benchmark-detail')
    expect(router.currentRoute.value.params.id).toBe('12')
  })

  it('redirects unknown routes to home', async () => {
    const { router } = await loadRouterWithAuth({
      isAuthenticated: true,
      role: 'USER',
    })

    await router.push('/missing-route')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
  })
})
