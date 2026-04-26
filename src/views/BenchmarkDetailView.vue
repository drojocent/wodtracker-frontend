<template>
  <div class="content-grid">
    <section class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <div v-if="benchmarkStore.isLoadingBenchmark" class="panel-card">
        Cargando benchmark...
      </div>

      <section v-else-if="benchmark" class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Benchmark</p>
            <h2>{{ benchmark.name || benchmark.title }}</h2>
          </div>
          <span class="badge">{{ benchmark.type || 'Sin tipo' }}</span>
        </div>

        <p class="card-description">{{ benchmark.description || 'Sin descripción disponible.' }}</p>

        <div class="wod-grid benchmark-stats-grid">
          <div class="wod-stat">
            <span class="wod-label">Resultados guardados</span>
            <strong>{{ results.length }}</strong>
          </div>
        </div>
      </section>

      <div v-else class="panel-card empty-state">
        <h2>Benchmark no encontrado</h2>
        <p>No se ha podido cargar el detalle solicitado.</p>
      </div>
    </section>

    <aside class="content-column side-column">
      <BenchmarkResultForm
        :benchmark-id="benchmarkId"
        :loading="benchmarkStore.isSubmittingResult"
        @submit="handleSubmitResult"
      />

      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Historial</p>
            <h2>Mis resultados</h2>
          </div>
        </div>

        <p v-if="benchmarkStore.isLoadingMyResults" class="muted-text">Cargando historial...</p>
        <ul v-else-if="results.length" class="results-list">
          <li v-for="result in results" :key="result.id || result.createdAt">
            <strong>{{ result.result || 'Sin marca' }}</strong>
            <span>{{ formatDateTime(result.createdAt) }}</span>
          </li>
        </ul>
        <p v-else class="muted-text">Todavía no has registrado resultados para este benchmark.</p>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BenchmarkResultForm from '@/components/BenchmarkResultForm.vue'
import { useBenchmarkStore } from '@/stores/benchmarkStore'

const route = useRoute()
const benchmarkStore = useBenchmarkStore()

const errorMessage = ref('')
const successMessage = ref('')

const benchmarkId = computed(() => route.params.id || '')
const benchmark = computed(() => benchmarkStore.currentBenchmark)
const results = computed(() => benchmarkStore.myResults)

onMounted(async () => {
  await loadBenchmarkDetail()
})

watch(
  () => route.params.id,
  async () => {
    await loadBenchmarkDetail()
  },
)

async function loadBenchmarkDetail() {
  errorMessage.value = ''

  if (!benchmarkId.value) {
    return
  }

  try {
    await Promise.all([
      benchmarkStore.loadBenchmarkById(benchmarkId.value),
      benchmarkStore.loadMyResults(benchmarkId.value),
    ])
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handleSubmitResult(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await benchmarkStore.createResult(benchmarkId.value, payload)
    successMessage.value = 'Resultado guardado correctamente.'
  } catch (error) {
    errorMessage.value = error.message
  }
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
