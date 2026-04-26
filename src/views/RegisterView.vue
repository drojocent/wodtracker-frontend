<template>
  <section class="page-shell auth-page">
    <div class="auth-card">
      <h1>Crear cuenta</h1>
      <p>Registra tu usuario para empezar a seguir entrenamientos, marcas y propuestas de WOD.</p>

      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="field-group">
          <label for="name">Nombre</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>

        <div class="field-group">
          <label for="register-email">Email</label>
          <input id="register-email" v-model="form.email" type="email" required />
        </div>

        <div class="field-group">
          <label for="register-password">Contraseña</label>
          <input id="register-password" v-model="form.password" type="password" required />
        </div>

        <div class="auth-actions">
          <button class="primary-button" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Creando cuenta...' : 'Registrarse' }}
          </button>
        </div>
      </form>

      <p class="helper-text">
        Ya tienes cuenta?
        <RouterLink class="helper-link" to="/login">Inicia sesion</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const form = reactive({
  name: '',
  email: '',
  password: '',
})

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.register(form)
    form.name = ''
    form.email = ''
    form.password = ''
    router.push({
      name: 'login',
      query: { registered: '1' },
    })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
