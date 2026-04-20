<template>
  <article class="panel-card wod-card">
    <div class="card-header">
      <div>
        <p class="eyebrow">WOD del día</p>
        <h2>{{ title }}</h2>
      </div>
      <span class="badge">{{ wodType }}</span>
    </div>

    <p v-if="description" class="card-description">{{ description }}</p>

    <div class="wod-grid">
      <div class="wod-stat">
        <span class="wod-label">Formato</span>
        <strong>{{ wodType }}</strong>
      </div>
      <div class="wod-stat">
        <span class="wod-label">Fecha</span>
        <strong>{{ formattedDate }}</strong>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  wod: {
    type: Object,
    default: null,
  },
})

const title = computed(() => props.wod?.name || props.wod?.title || 'Entrenamiento pendiente')
const description = computed(
  () => props.wod?.description || props.wod?.details || 'Todavía no hay una descripción disponible.',
)
const wodType = computed(() => props.wod?.type || props.wod?.format || 'No definido')
const formattedDate = computed(() => {
  const value = props.wod?.date || props.wod?.scheduledDate || props.wod?.createdAt

  if (!value) {
    return 'Hoy'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
})
</script>
