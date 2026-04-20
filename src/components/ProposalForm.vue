<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Comunidad</p>
        <h2>Enviar propuesta</h2>
      </div>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="proposal-title">Título</label>
        <input id="proposal-title" v-model="form.title" type="text" required />
      </div>

      <div class="field-group">
        <label for="proposal-type">Formato</label>
        <select id="proposal-type" v-model="form.type" required>
          <option disabled value="">Selecciona un formato</option>
          <option v-for="option in formatOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="proposal-description">Descripción</label>
        <textarea id="proposal-description" v-model="form.description" rows="6" required></textarea>
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading">
      {{ loading ? 'Enviando...' : 'Enviar propuesta' }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  type: '',
  description: '',
})

const formatOptions = [
  { value: 'FOR_TIME', label: 'For Time' },
  { value: 'AMRAP', label: 'AMRAP' },
  { value: 'EMOM', label: 'EMOM' },
]

function submitForm() {
  emit('submit', {
    name: form.title,
    title: form.title,
    type: form.type,
    description: form.description,
  })
  form.title = ''
  form.type = ''
  form.description = ''
}
</script>
