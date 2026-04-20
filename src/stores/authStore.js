import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import { clearAuthData, getStoredAuth, setAuthData } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)
  const role = ref('')
  const isHydrated = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const displayName = computed(
    () => user.value?.name || user.value?.fullName || user.value?.username || 'Atleta',
  )

  function hydrateAuth() {
    const stored = getStoredAuth()
    token.value = stored.token
    user.value = stored.user
    role.value = stored.role || extractRoleFromToken(stored.token)
    isHydrated.value = true
  }

  async function login(credentials) {
    const response = await authService.login(credentials)
    const authPayload = normalizeAuthResponse(response)

    token.value = authPayload.token
    user.value = authPayload.user
    role.value = authPayload.role
    setAuthData(authPayload)

    return authPayload
  }

  async function register(payload) {
    return authService.register(payload)
  }

  function logout() {
    token.value = ''
    user.value = null
    role.value = ''
    clearAuthData()
  }

  function setUserProfile(profile) {
    user.value = profile
    const nextPayload = {
      token: token.value,
      user: profile,
      role: profile?.role || role.value || extractRoleFromToken(token.value),
    }
    role.value = nextPayload.role
    setAuthData(nextPayload)
  }

  return {
    token,
    user,
    role,
    isHydrated,
    isAuthenticated,
    displayName,
    hydrateAuth,
    login,
    register,
    logout,
    setUserProfile,
  }
})

function normalizeAuthResponse(response) {
  const token = response?.token || response?.jwt || response?.accessToken || ''
  const user = response?.user || response?.profile || null
  const role = user?.role || response?.role || extractRoleFromToken(token) || 'USER'

  return { token, user, role }
}

function extractRoleFromToken(token) {
  if (!token) {
    return ''
  }

  try {
    const [, payloadPart] = token.split('.')

    if (!payloadPart) {
      return ''
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = JSON.parse(window.atob(padded))

    return (
      decoded?.role ||
      decoded?.roles?.[0] ||
      decoded?.authorities?.[0] ||
      decoded?.scope?.split(' ')?.find((value) => value === 'ADMIN' || value === 'USER') ||
      ''
    )
  } catch {
    return ''
  }
}
