<template>
  <div class="content-grid">
    <section class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">PR</p>
            <h2>{{ exerciseLabel }}</h2>
          </div>
        </div>

        <div class="wod-grid benchmark-stats-grid">
          <div class="wod-stat">
            <span class="wod-label">PR actual</span>
            <strong>{{ currentWeight }}</strong>
          </div>
          <div class="wod-stat">
            <span class="wod-label">Entradas registradas</span>
            <strong>{{ history.length }}</strong>
          </div>
        </div>
      </section>

      <PRProgressChart :history="orderedHistoryForChart" />
    </section>

    <aside class="content-column side-column">
      <PersonalRecordForm
        :loading="prStore.isSubmittingPr"
        @submit="handleSubmitPr"
      />

      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Historial</p>
            <h2>Mis marcas</h2>
          </div>
        </div>

        <p v-if="prStore.isLoadingHistory" class="muted-text">Cargando historial...</p>
        <ul v-else-if="history.length" class="results-list">
          <li v-for="record in history" :key="record.id || record.createdAt">
            <strong>{{ formatWeight(record.weight) }}</strong>
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </li>
        </ul>
        <p v-else class="muted-text">Todavia no has registrado marcas para este ejercicio.</p>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PRProgressChart from '@/components/PRProgressChart.vue'
import PersonalRecordForm from '@/components/PersonalRecordForm.vue'
import { usePrStore } from '@/stores/prStore'
import { getExerciseLabel } from '@/utils/personalRecords'

const route = useRoute()
const prStore = usePrStore()

const errorMessage = ref('')
const successMessage = ref('')

const exercise = computed(() => route.params.exercise || '')
const exerciseLabel = computed(() => getExerciseLabel(exercise.value))
const history = computed(() => prStore.history)
const orderedHistoryForChart = computed(() => [...prStore.history].slice().reverse())
const currentWeight = computed(() => {
  const weight = prStore.currentPr?.weight
  return weight ? formatWeight(weight) : 'Sin marca'
})

onMounted(async () => {
  await loadPrDetail()
})

watch(
  () => route.params.exercise,
  async () => {
    await loadPrDetail()
  },
)

async function loadPrDetail() {
  errorMessage.value = ''

  if (!exercise.value) {
    return
  }

  try {
    await Promise.allSettled([
      prStore.loadCurrentPr(exercise.value),
      prStore.loadHistory(exercise.value),
    ])
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handleSubmitPr(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await prStore.createPr(exercise.value, payload)
    successMessage.value = 'Marca personal guardada correctamente.'
  } catch (error) {
    errorMessage.value = error.message
  }
}

function formatWeight(value) {
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} kg`
}

function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style scoped>
.benchmark-stats-grid {
  margin-top: 1.5rem;
}
</style>
