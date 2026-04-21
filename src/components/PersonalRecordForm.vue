<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Marca personal</p>
        <h2>Registrar nuevo peso</h2>
      </div>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="pr-weight">Peso</label>
        <input
          id="pr-weight"
          v-model="form.weight"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Ej. 100"
          required
        />
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading">
      {{ loading ? 'Guardando...' : 'Guardar PR' }}
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
  weight: '',
})

function submitForm() {
  emit('submit', {
    weight: form.weight,
  })
  form.weight = ''
}
</script>
