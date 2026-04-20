<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Administración</p>
        <h2>{{ isEditing ? 'Editar WOD' : 'Crear WOD' }}</h2>
      </div>
    </div>

    <div class="form-grid two-columns">
      <div class="field-group">
        <label for="wod-title">Nombre</label>
        <input id="wod-title" v-model="form.title" type="text" required />
      </div>

      <div class="field-group">
        <label for="wod-type">Formato</label>
        <select id="wod-type" v-model="form.type" required>
          <option disabled value="">Selecciona un formato</option>
          <option v-for="option in formatOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="wod-date">Fecha</label>
        <input id="wod-date" v-model="form.date" type="date" :min="todayDate" required />
      </div>
    </div>

    <div class="field-group">
      <label for="wod-description">Descripción</label>
      <textarea id="wod-description" v-model="form.description" rows="5" required></textarea>
    </div>

    <div class="inline-actions">
      <button class="primary-button align-start" type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : isEditing ? 'Actualizar WOD' : 'Crear WOD' }}
      </button>

      <button
        v-if="isEditing"
        class="secondary-button align-start"
        type="button"
        @click="$emit('cancel')"
      >
        Cancelar edición
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'submit'])

const form = reactive({
  title: '',
  type: '',
  date: '',
  description: '',
})

const formatOptions = [
  { value: 'FOR_TIME', label: 'For Time' },
  { value: 'AMRAP', label: 'AMRAP' },
  { value: 'EMOM', label: 'EMOM' },
]
const todayDate = new Date().toISOString().slice(0, 10)

const isEditing = computed(() => Boolean(props.initialValue))

watch(
  () => props.initialValue,
  (value) => {
    form.title = value?.title || value?.name || ''
    form.type = value?.type || value?.format || ''
    form.date = formatDateInput(value?.date || value?.scheduledDate || value?.createdAt || '')
    form.description = value?.description || value?.details || ''
  },
  { immediate: true },
)

function submitForm() {
  emit('submit', {
    name: form.title,
    title: form.title,
    type: form.type,
    date: form.date || null,
    description: form.description,
    approved: true,
  })
}

function formatDateInput(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}
</script>
