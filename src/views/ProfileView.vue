<template>
  <div class="content-grid single-column">
    <div v-if="errorMessage" class="status-message error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="status-message success">
      {{ successMessage }}
    </div>

    <ProfileForm
      :profile="currentProfile"
      :loading="userStore.isLoadingProfile"
      @submit="handleUpdateProfile"
    />

    <div v-if="passwordErrorMessage" class="status-message error">
      {{ passwordErrorMessage }}
    </div>

    <div v-if="passwordSuccessMessage" class="status-message success">
      {{ passwordSuccessMessage }}
    </div>

    <PasswordChangeForm
      :loading="userStore.isLoadingProfile"
      @submit="handlePasswordChange"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PasswordChangeForm from '@/components/PasswordChangeForm.vue'
import ProfileForm from '@/components/ProfileForm.vue'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'

const authStore = useAuthStore()
const userStore = useUserStore()

const errorMessage = ref('')
const successMessage = ref('')
const passwordErrorMessage = ref('')
const passwordSuccessMessage = ref('')
const currentProfile = computed(() => userStore.profile || authStore.user)

onMounted(async () => {
  try {
    await userStore.loadProfile()
  } catch (error) {
    errorMessage.value = error.message
  }
})

async function handleUpdateProfile(payload) {
  errorMessage.value = ''
  successMessage.value = ''
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''

  try {
    await userStore.updateProfile(payload)
    successMessage.value = 'Perfil actualizado correctamente.'
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handlePasswordChange(payload) {
  errorMessage.value = ''
  successMessage.value = ''
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''

  try {
    await userStore.updateProfile({ password: payload.password })
    passwordSuccessMessage.value = 'Contraseña actualizada correctamente.'
  } catch (error) {
    passwordErrorMessage.value = error.message
  }
}
</script>
