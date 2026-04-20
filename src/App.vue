<template>
  <RouterView />
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { AUTH_UNAUTHORIZED_EVENT } from '@/utils/auth'

const authStore = useAuthStore()
const router = useRouter()

function handleUnauthorized() {
  authStore.logout()

  if (router.currentRoute.value.name !== 'login') {
    router.replace('/login')
  }
}

onMounted(() => {
  authStore.hydrateAuth()
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})

onBeforeUnmount(() => {
  window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})
</script>
