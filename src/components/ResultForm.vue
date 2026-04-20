<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Guardar resultado</p>
        <h2>{{ isEditing ? 'Editar marca' : 'Registrar marca' }}</h2>
      </div>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="score">Resultado</label>
        <input id="score" v-model="form.score" type="text" placeholder="Ej. 12:34 / 185 lb / 7 rondas" required />
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading || !wodId">
      {{ loading ? 'Guardando...' : isEditing ? 'Actualizar resultado' : 'Guardar resultado' }}
    </button>
  </form>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  wodId: {
    type: [String, Number],
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  score: '',
})

const isEditing = computed(() => Boolean(props.initialValue?.id || props.initialValue?._id))

function submitForm() {
  emit('submit', {
    id: props.initialValue?.id || props.initialValue?._id || '',
    wodId: props.wodId,
    result: form.score,
  })
}

watch(
  () => [props.wodId, props.initialValue],
  () => {
    form.score = props.initialValue?.result || props.initialValue?.score || ''
  },
  { immediate: true },
)
</script>
