<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Administracion</p>
        <h2>Crear usuario</h2>
      </div>
    </div>

    <div class="form-grid two-columns">
      <div class="field-group">
        <label for="admin-user-name">Nombre</label>
        <input id="admin-user-name" v-model.trim="form.name" type="text" required />
      </div>

      <div class="field-group">
        <label for="admin-user-email">Email</label>
        <input id="admin-user-email" v-model.trim="form.email" type="email" required />
      </div>

      <div class="field-group">
        <label for="admin-user-role">Rol</label>
        <select id="admin-user-role" v-model="form.role" required>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading">
      {{ loading ? 'Creando...' : 'Crear usuario' }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  email: '',
  role: 'USER',
})

function submitForm() {
  emit('submit', {
    name: form.name,
    email: form.email,
    role: form.role,
  })
}
</script>
