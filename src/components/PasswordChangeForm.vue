<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Seguridad</p>
        <h2>Cambiar contraseña</h2>
      </div>
    </div>

    <div v-if="validationMessage" class="status-message error compact-status">
      {{ validationMessage }}
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="new-password">Nueva contraseña</label>
        <div class="password-input">
          <input
            id="new-password"
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            required
          />
          <button
            class="password-toggle"
            type="button"
            @click="showNewPassword = !showNewPassword"
          >
            {{ showNewPassword ? 'Ocultar' : 'Ver' }}
          </button>
        </div>
      </div>

      <div class="field-group">
        <label for="repeat-password">Repetir nueva contraseña</label>
        <div class="password-input">
          <input
            id="repeat-password"
            v-model="form.repeatPassword"
            :type="showRepeatPassword ? 'text' : 'password'"
            required
          />
          <button
            class="password-toggle"
            type="button"
            @click="showRepeatPassword = !showRepeatPassword"
          >
            {{ showRepeatPassword ? 'Ocultar' : 'Ver' }}
          </button>
        </div>
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading">
      {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  newPassword: '',
  repeatPassword: '',
})

const validationMessage = ref('')
const showNewPassword = ref(false)
const showRepeatPassword = ref(false)

function submitForm() {
  validationMessage.value = ''

  if (!form.newPassword || !form.repeatPassword) {
    validationMessage.value = 'Completa los dos campos de contraseña.'
    return
  }

  if (form.newPassword !== form.repeatPassword) {
    validationMessage.value = 'La nueva contraseña y su confirmación deben coincidir.'
    return
  }

  emit('submit', {
    password: form.newPassword,
  })

  form.newPassword = ''
  form.repeatPassword = ''
}
</script>
