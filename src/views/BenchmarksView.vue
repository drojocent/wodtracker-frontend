<template>
  <section class="content-grid benchmarks-page">
    <div class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <section class="benchmarks-hero" aria-labelledby="benchmarks-title">
        <div>
          <p class="eyebrow">Benchmarks</p>
          <h2 id="benchmarks-title">WODs de referencia</h2>
          <p>Ponte a prueba con benchmarks conocidos y registra tus resultados.</p>
        </div>


      </section>

      <section class="benchmarks-toolbar" aria-label="Filtros de benchmarks">
        <div class="benchmark-search">
          <label for="benchmark-search">Buscar benchmark</label>
          <input
            id="benchmark-search"
            v-model.trim="searchTerm"
            type="search"
            placeholder="Fran, Murph, Cindy..."
            autocomplete="off"
          >
        </div>

        <div class="benchmark-filter">
          <label for="benchmark-type-filter">Tipo</label>
          <select id="benchmark-type-filter" v-model="selectedType">
            <option value="">Todos</option>
            <option v-for="type in availableTypes" :key="type" :value="type">
              {{ formatType(type) }}
            </option>
          </select>
        </div>

        <p class="benchmark-result-count" aria-live="polite">
          {{ resultCountText }}
        </p>
      </section>

      <section
        v-if="benchmarkStore.isLoadingBenchmarks"
        class="benchmarks-grid"
        aria-label="Cargando benchmarks"
        aria-busy="true"
      >
        <article v-for="index in 4" :key="index" class="benchmark-card benchmark-card-loading">
          <span class="benchmark-type-pill"></span>
          <span class="benchmark-loading-line wide"></span>
          <span class="benchmark-loading-line"></span>
        </article>
      </section>

      <section v-else-if="filteredBenchmarks.length" class="benchmarks-grid" aria-label="Benchmarks disponibles">
        <article
          v-for="benchmark in filteredBenchmarks"
          :key="getBenchmarkId(benchmark)"
          class="benchmark-card"
        >
          <div class="benchmark-card-header">
            <span class="benchmark-type-pill">{{ formatType(benchmark.type) }}</span>
          </div>

          <RouterLink
            class="benchmark-title"
            :to="{ name: 'benchmark-detail', params: { id: getBenchmarkId(benchmark) } }"
            :aria-label="`Ver detalle de ${getBenchmarkName(benchmark)}`"
          >
            {{ getBenchmarkName(benchmark) }}
          </RouterLink>

          <p>{{ getBenchmarkDescription(benchmark) }}</p>

          <div class="benchmark-card-actions">
            <RouterLink
              class="secondary-button align-start"
              :to="{ name: 'benchmark-detail', params: { id: getBenchmarkId(benchmark) } }"
            >
              Ver detalle
            </RouterLink>
            <button
              v-if="isAdmin"
              class="secondary-button align-start"
              type="button"
              :disabled="benchmarkStore.isSavingBenchmark"
              @click="startEditing(benchmark)"
            >
              Editar
            </button>
            <button
              v-if="isAdmin"
              class="secondary-button align-start danger-button"
              type="button"
              :disabled="benchmarkStore.isDeletingBenchmark"
              @click="handleDeleteBenchmark(benchmark)"
            >
              Eliminar
            </button>
          </div>
        </article>
      </section>

      <section v-else class="benchmarks-empty" aria-live="polite">
        <h2>{{ emptyTitle }}</h2>
        <p>{{ emptyDescription }}</p>
      </section>
    </div>

    <aside v-if="isAdmin" class="content-column side-column">
      <BenchmarkForm
        :initial-value="editingBenchmark"
        :loading="benchmarkStore.isSavingBenchmark"
        @cancel="cancelEditing"
        @submit="handleSaveBenchmark"
      />
    </aside>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BenchmarkForm from '@/components/BenchmarkForm.vue'
import { useAuthStore } from '@/stores/authStore'
import { useBenchmarkStore } from '@/stores/benchmarkStore'

const authStore = useAuthStore()
const benchmarkStore = useBenchmarkStore()

const editingBenchmark = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const selectedType = ref('')

const isAdmin = computed(() => authStore.role === 'ADMIN')
const benchmarks = computed(() =>
  [...benchmarkStore.benchmarks].sort((left, right) => compareDates(right?.createdAt, left?.createdAt)),
)
const availableTypes = computed(() =>
  [...new Set(benchmarks.value.map((benchmark) => benchmark.type).filter(Boolean))].sort(),
)
const filteredBenchmarks = computed(() => {
  const normalizedSearch = normalizeText(searchTerm.value)

  return benchmarks.value.filter((benchmark) => {
    const matchesType = !selectedType.value || benchmark.type === selectedType.value
    const matchesSearch = !normalizedSearch
      || normalizeText(`${getBenchmarkName(benchmark)} ${benchmark.description || ''} ${benchmark.type || ''}`).includes(normalizedSearch)

    return matchesType && matchesSearch
  })
})
const resultCountText = computed(() => {
  if (benchmarkStore.isLoadingBenchmarks) {
    return 'Cargando benchmarks...'
  }

  const count = filteredBenchmarks.value.length
  return count === 1 ? '1 benchmark disponible' : `${count} benchmarks disponibles`
})
const emptyTitle = computed(() => (benchmarks.value.length ? 'No hay coincidencias' : 'Todavia no hay benchmarks'))
const emptyDescription = computed(() =>
  benchmarks.value.length
    ? 'Prueba con otro nombre o cambia el filtro de tipo.'
    : 'Cuando se registren benchmarks apareceran aqui.',
)

onMounted(async () => {
  try {
    await benchmarkStore.loadBenchmarks()
  } catch (error) {
    errorMessage.value = error.message
  }
})

async function handleSaveBenchmark(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await benchmarkStore.saveBenchmark(payload, getBenchmarkId(editingBenchmark.value))
    successMessage.value = editingBenchmark.value
      ? 'Benchmark actualizado correctamente.'
      : 'Benchmark creado correctamente.'
    editingBenchmark.value = null
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handleDeleteBenchmark(benchmark) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await benchmarkStore.removeBenchmark(getBenchmarkId(benchmark))
    successMessage.value = 'Benchmark eliminado correctamente.'

    if (getBenchmarkId(editingBenchmark.value) === getBenchmarkId(benchmark)) {
      editingBenchmark.value = null
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}

function startEditing(benchmark) {
  editingBenchmark.value = { ...benchmark }
}

function cancelEditing() {
  editingBenchmark.value = null
}

function getBenchmarkId(benchmark) {
  return benchmark?.id || benchmark?._id || benchmark?.benchmarkId || ''
}

function getBenchmarkName(benchmark) {
  return benchmark?.name || benchmark?.title || 'Benchmark'
}

function getBenchmarkDescription(benchmark) {
  const description = benchmark?.description || ''

  if (!description) {
    return 'Sin descripcion registrada.'
  }

  return description.length > 130 ? `${description.slice(0, 130).trim()}...` : description
}

function formatType(value) {
  return value ? value.replace(/_/g, ' ') : 'Sin tipo'
}

function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function compareDates(left, right) {
  if (!left && !right) {
    return 0
  }

  if (!left) {
    return -1
  }

  if (!right) {
    return 1
  }

  return new Date(left).getTime() - new Date(right).getTime()
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
</script>

<style scoped>
.benchmarks-page {
  align-items: start;
}

.benchmarks-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: end;
  padding: 1.5rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(214, 40, 57, 0.16), transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 42%),
    rgba(38, 38, 44, 0.84);
  box-shadow: var(--shadow-panel);
}

.benchmarks-hero h2 {
  margin: 0.2rem 0 0.45rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.05;
}

.benchmarks-hero p,
.benchmark-card p,
.benchmark-date,
.benchmark-result-count {
  margin: 0;
  color: var(--color-text-muted);
}

.benchmarks-summary {
  min-width: 132px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 0.15rem;
}

.benchmarks-summary span {
  color: var(--color-text-muted);
}

.benchmarks-summary strong {
  font-size: 2rem;
  line-height: 1;
}

.benchmarks-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(160px, 220px) auto;
  gap: 1rem;
  align-items: end;
}

.benchmark-search,
.benchmark-filter {
  display: grid;
  gap: 0.45rem;
}

.benchmark-search label,
.benchmark-filter label {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.benchmark-search input,
.benchmark-filter select {
  width: 100%;
  min-height: 48px;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.benchmark-filter select {
  appearance: none;
  background:
    linear-gradient(45deg, transparent 50%, #f1f1f2 50%),
    linear-gradient(135deg, #f1f1f2 50%, transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08));
  background-position:
    calc(100% - 18px) calc(50% - 3px),
    calc(100% - 12px) calc(50% - 3px),
    0 0;
  background-size: 6px 6px, 6px 6px, 100% 100%;
  background-repeat: no-repeat;
  padding-right: 2.8rem;
}

.benchmark-filter option {
  background: #2f2f35;
  color: #f5f5f5;
}

.benchmark-search input:focus,
.benchmark-filter select:focus,
.benchmark-title:focus-visible {
  outline: none;
  border-color: rgba(255, 51, 71, 0.65);
  box-shadow: 0 0 0 4px rgba(214, 40, 57, 0.15);
}

.benchmark-result-count {
  align-self: center;
  white-space: nowrap;
}

.benchmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.benchmark-card {
  min-height: 220px;
  padding: 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 52%),
    var(--color-bg-panel);
  display: grid;
  gap: 0.85rem;
  align-content: start;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.benchmark-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 95, 113, 0.36);
  background:
    linear-gradient(180deg, rgba(214, 40, 57, 0.12), transparent 56%),
    var(--color-bg-panel-strong);
}

.benchmark-card-header,
.benchmark-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  justify-content: space-between;
}

.benchmark-type-pill {
  min-width: 70px;
  min-height: 32px;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: var(--color-accent-soft);
  color: #ffb8c0;
  border: 1px solid rgba(255, 95, 113, 0.22);
  font-size: 0.78rem;
  font-weight: 800;
}

.benchmark-title {
  width: fit-content;
  border-radius: 10px;
  color: var(--color-text);
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.15;
}

.benchmark-card-actions {
  justify-content: flex-start;
  margin-top: auto;
}

.benchmarks-empty {
  padding: 2rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: 18px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
}

.benchmarks-empty h2,
.benchmarks-empty p {
  margin: 0;
}

.benchmarks-empty p {
  margin-top: 0.35rem;
}

.benchmark-card-loading {
  pointer-events: none;
}

.benchmark-card-loading .benchmark-type-pill,
.benchmark-loading-line {
  animation: benchmark-pulse 1.2s ease-in-out infinite;
}

.benchmark-loading-line {
  display: block;
  width: 56%;
  height: 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.benchmark-loading-line.wide {
  width: 78%;
  height: 1.25rem;
}

@keyframes benchmark-pulse {
  0%,
  100% {
    opacity: 0.48;
  }

  50% {
    opacity: 1;
  }
}

@media (max-width: 720px) {
  .benchmarks-hero,
  .benchmarks-toolbar {
    grid-template-columns: 1fr;
  }

  .benchmarks-summary {
    width: 100%;
  }

  .benchmark-result-count {
    white-space: normal;
  }
}
</style>
