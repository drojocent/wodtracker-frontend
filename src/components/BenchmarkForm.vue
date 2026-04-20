<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Benchmarks</p>
        <h2>{{ isEditing ? 'Editar benchmark' : 'Crear benchmark' }}</h2>
      </div>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="benchmark-name">Nombre</label>
        <input
          id="benchmark-name"
          v-model="form.name"
          type="text"
          maxlength="150"
          placeholder="Ej. Fran"
          required
        />
      </div>

      <div class="field-group">
        <label for="benchmark-type">Tipo</label>
        <select id="benchmark-type" v-model="form.type" required>
          <option value="">Selecciona un tipo</option>
          <option value="FOR_TIME">FOR_TIME</option>
          <option value="AMRAP">AMRAP</option>
          <option value="EMOM">EMOM</option>
        </select>
      </div>

      <div class="field-group">
        <label for="benchmark-description">Descripción</label>
        <textarea
          id="benchmark-description"
          v-model="form.description"
          rows="5"
          placeholder="Describe el benchmark"
          required
        ></textarea>
      </div>
    </div>

    <div class="inline-actions">
      <button class="primary-button align-start" type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : isEditing ? 'Actualizar benchmark' : 'Crear benchmark' }}
      </button>
      <button
        v-if="isEditing"
        class="secondary-button align-start"
        type="button"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancelar
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

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '',
  description: '',
  type: '',
})

const isEditing = computed(() => Boolean(props.initialValue?.id || props.initialValue?._id))

function submitForm() {
  emit('submit', {
    name: form.name,
    description: form.description,
    type: form.type,
  })
}

watch(
  () => props.initialValue,
  () => {
    form.name = props.initialValue?.name || props.initialValue?.title || ''
    form.description = props.initialValue?.description || ''
    form.type = props.initialValue?.type || ''
  },
  { immediate: true },
)
</script>
