<template>
  <article class="panel-card stacked-form">
    <div class="card-header">
      <div>
        <p class="eyebrow">Propuesta</p>
        <h2>{{ title }}</h2>
      </div>
      <span class="badge">{{ type }}</span>
    </div>

    <div class="proposal-meta">
      <span><strong>Autor:</strong> {{ author }}</span>
    </div>

    <p class="card-description">{{ description }}</p>

    <div class="inline-actions">
      <button class="primary-button align-start" type="button" :disabled="loading" @click="$emit('approve')">
        Aprobar
      </button>
      <button class="secondary-button align-start" type="button" :disabled="loading" @click="$emit('reject')">
        Rechazar
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['approve', 'reject'])

const title = computed(() => props.proposal.title || props.proposal.name || 'Propuesta sin título')
const type = computed(() => props.proposal.type || props.proposal.format || 'General')
const author = computed(
  () =>
    props.proposal.userName ||
    props.proposal.authorName ||
    props.proposal.createdBy ||
    props.proposal.user?.name ||
    'Usuario',
)
const description = computed(
  () => props.proposal.description || props.proposal.details || 'Sin descripción disponible.',
)
</script>
