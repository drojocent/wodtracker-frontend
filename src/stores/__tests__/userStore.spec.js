import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const getProfileMock = vi.fn()
const updateProfileMock = vi.fn()
const getResultsByUserMock = vi.fn()

vi.mock('@/services/userService', () => ({
  default: {
    getProfile: getProfileMock,
    updateProfile: updateProfileMock,
  },
}))

vi.mock('@/services/resultService', () => ({
  default: {
    getResultsByUser: getResultsByUserMock,
  },
}))

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads and updates profile while syncing auth store', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    const { useUserStore } = await import('@/stores/userStore')
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const setUserProfileSpy = vi.spyOn(authStore, 'setUserProfile')

    getProfileMock.mockResolvedValue({ id: 7, name: 'Dani' })
    updateProfileMock.mockResolvedValue({ id: 7, name: 'Daniel' })

    await expect(userStore.loadProfile()).resolves.toEqual({ id: 7, name: 'Dani' })
    await expect(userStore.updateProfile({ name: 'Daniel' })).resolves.toEqual({ id: 7, name: 'Daniel' })

    expect(setUserProfileSpy).toHaveBeenCalledTimes(2)
  })

  it('loads results using the current user id and hydrates profile if needed', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    const { useUserStore } = await import('@/stores/userStore')
    const authStore = useAuthStore()
    const userStore = useUserStore()

    authStore.user = { id: 9, name: 'Athlete' }
    getResultsByUserMock.mockResolvedValue([{ id: 1 }])

    await expect(userStore.loadResults()).resolves.toEqual([{ id: 1 }])

    expect(getResultsByUserMock).toHaveBeenCalledWith(9)
  })
})
