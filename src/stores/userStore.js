import { ref } from 'vue'
import { defineStore } from 'pinia'
import resultService from '@/services/resultService'
import userService from '@/services/userService'
import { useAuthStore } from './authStore'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const results = ref([])
  const isLoadingProfile = ref(false)
  const isLoadingResults = ref(false)

  function setProfile(nextProfile) {
    profile.value = nextProfile
  }

  function setResults(nextResults) {
    results.value = Array.isArray(nextResults) ? nextResults : []
  }

  function resolveUserId() {
    const authStore = useAuthStore()

    return (
      profile.value?.id ||
      profile.value?._id ||
      profile.value?.userId ||
      authStore.user?.id ||
      authStore.user?._id ||
      authStore.user?.userId ||
      ''
    )
  }

  async function loadProfile() {
    const authStore = useAuthStore()
    isLoadingProfile.value = true

    try {
      const data = await userService.getProfile()
      setProfile(data)
      authStore.setUserProfile(data)
      return data
    } finally {
      isLoadingProfile.value = false
    }
  }

  async function updateProfile(payload) {
    const authStore = useAuthStore()
    isLoadingProfile.value = true

    try {
      const data = await userService.updateProfile(payload)
      setProfile(data)
      authStore.setUserProfile(data)
      return data
    } finally {
      isLoadingProfile.value = false
    }
  }

  async function loadResults() {
    isLoadingResults.value = true

    try {
      let currentUserId = resolveUserId()

      if (!currentUserId) {
        await loadProfile()
        currentUserId = resolveUserId()
      }

      if (!currentUserId) {
        setResults([])
        return []
      }

      const data = await resultService.getResultsByUser(currentUserId)
      setResults(data)
      return data
    } finally {
      isLoadingResults.value = false
    }
  }

  return {
    profile,
    results,
    isLoadingProfile,
    isLoadingResults,
    setProfile,
    setResults,
    loadProfile,
    updateProfile,
    loadResults,
  }
})
