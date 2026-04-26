<template>
  <section class="page-shell auth-page">
    <div class="auth-card">
      <h1>Iniciar sesión</h1>
      <p>Accede a WODTracker para consultar tu WOD del día, registrar resultados y seguir tu progreso.</p>

      <div v-if="statusMessage" class="status-message success">
        {{ statusMessage }}
      </div>

      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="field-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" required />
        </div>

        <div class="field-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" required />
        </div>

        <div class="auth-actions">
          <button class="primary-button" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
      </form>

      <p class="helper-text">
        No tienes cuenta?
        <RouterLink class="helper-link" to="/register">Registrate</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const form = reactive({
  email: '',
  password: '',
})

const statusMessage = computed(() =>
  route.query.registered === '1' ? 'Cuenta creada correctamente. Ya puedes iniciar sesión.' : '',
)

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(form)
    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirectPath)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
