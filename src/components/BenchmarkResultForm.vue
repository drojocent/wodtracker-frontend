<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Resultado</p>
        <h2>Añadir marca</h2>
      </div>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="benchmark-score">Resultado</label>
        <input
          id="benchmark-score"
          v-model="form.score"
          type="text"
          placeholder="Ej. 03:45 / 15 rondas / 12 reps"
          required
        />
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading || !benchmarkId">
      {{ loading ? 'Guardando...' : 'Guardar resultado' }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  benchmarkId: {
    type: [String, Number],
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  score: '',
})

function submitForm() {
  emit('submit', {
    benchmarkId: props.benchmarkId,
    result: form.score,
  })
  form.score = ''
}
</script>
