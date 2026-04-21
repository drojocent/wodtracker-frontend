<template>
  <section class="content-grid single-column prs-page">
    <div class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <section class="prs-hero" aria-labelledby="prs-title">
        <div class="prs-hero-copy">
          <p class="eyebrow">Marcas personales</p>
          <h2 id="prs-title">Elige un levantamiento</h2>
          <p>Consulta, registra y compara tus mejores marcas por ejercicio.</p>
        </div>
      </section>

      <section class="prs-toolbar" aria-label="Filtros de marcas personales">
        <div class="prs-search">
          <label for="prs-search">Buscar ejercicio</label>
          <input
            id="prs-search"
            v-model.trim="searchTerm"
            type="search"
            placeholder="Back squat, snatch..."
            autocomplete="off"
          >
        </div>

        <p class="prs-result-count" aria-live="polite">
          {{ resultCountText }}
        </p>
      </section>

      <section
        v-if="prStore.isLoadingExercises"
        class="prs-grid"
        aria-label="Cargando ejercicios"
        aria-busy="true"
      >
        <article v-for="index in 6" :key="index" class="prs-card prs-card-loading">
          <span class="prs-card-mark"></span>
          <div>
            <span class="prs-loading-line wide"></span>
            <span class="prs-loading-line"></span>
          </div>
        </article>
      </section>

      <section v-else-if="filteredExercises.length" class="prs-grid" aria-label="Ejercicios disponibles">
        <RouterLink
          v-for="exercise in filteredExercises"
          :key="exercise"
          class="prs-card"
          :to="{ name: 'pr-detail', params: { exercise } }"
          :aria-label="`Ver detalle de ${getExerciseLabel(exercise)}`"
        >
          <span class="prs-card-mark" aria-hidden="true">{{ getExerciseInitials(exercise) }}</span>
          <span class="prs-card-content">
            <strong>{{ getExerciseLabel(exercise) }}</strong>
            <span>{{ getExerciseGroup(exercise) }}</span>
          </span>
          <span class="prs-card-action" aria-hidden="true">Ver detalle</span>
        </RouterLink>
      </section>

      <section v-else class="prs-empty" aria-live="polite">
        <h2>{{ emptyTitle }}</h2>
        <p>{{ emptyDescription }}</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePrStore } from '@/stores/prStore'
import { getExerciseLabel } from '@/utils/personalRecords'

const prStore = usePrStore()
const errorMessage = ref('')
const searchTerm = ref('')

const exercises = computed(() => prStore.exercises)
const filteredExercises = computed(() => {
  const normalizedSearch = normalizeText(searchTerm.value)

  if (!normalizedSearch) {
    return exercises.value
  }

  return exercises.value.filter((exercise) => {
    const label = getExerciseLabel(exercise)
    return normalizeText(`${label} ${exercise}`).includes(normalizedSearch)
  })
})
const resultCountText = computed(() => {
  if (prStore.isLoadingExercises) {
    return 'Cargando ejercicios...'
  }

  const count = filteredExercises.value.length
  return count === 1 ? '1 ejercicio disponible' : `${count} ejercicios disponibles`
})
const emptyTitle = computed(() => (exercises.value.length ? 'No hay coincidencias' : 'No hay ejercicios disponibles'))
const emptyDescription = computed(() =>
  exercises.value.length
    ? 'Prueba con otro nombre de levantamiento.'
    : 'Cuando haya ejercicios predefinidos apareceran aqui.',
)

onMounted(async () => {
  try {
    await prStore.loadExercises()
  } catch (error) {
    errorMessage.value = error.message
  }
})

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getExerciseInitials(exercise) {
  return getExerciseLabel(exercise)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function getExerciseGroup(exercise) {
  if (exercise.includes('SQUAT')) {
    return 'Pierna y estabilidad'
  }

  if (exercise.includes('PRESS') || exercise.includes('JERK')) {
    return 'Empuje'
  }

  if (exercise.includes('CLEAN') || exercise.includes('SNATCH')) {
    return 'Halterofilia'
  }

  return 'Fuerza maxima'
}
</script>

<style scoped>
.prs-page {
  max-width: 1120px;
}

.prs-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: end;
  padding: 1.5rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(214, 40, 57, 0.18), transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 42%),
    rgba(38, 38, 44, 0.84);
  box-shadow: var(--shadow-panel);
}

.prs-hero h2 {
  margin: 0.2rem 0 0.45rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.05;
}

.prs-hero p {
  margin: 0;
  color: var(--color-text-muted);
}

.prs-summary {
  min-width: 140px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 0.15rem;
}

.prs-summary span,
.prs-result-count,
.prs-card-content span {
  color: var(--color-text-muted);
}

.prs-summary strong {
  font-size: 2rem;
  line-height: 1;
}

.prs-toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 420px) minmax(0, 1fr);
  gap: 1rem;
  align-items: end;
}

.prs-search {
  display: grid;
  gap: 0.45rem;
}

.prs-search label {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.prs-search input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.prs-search input:focus {
  outline: none;
  border-color: rgba(255, 51, 71, 0.65);
  box-shadow: 0 0 0 4px rgba(214, 40, 57, 0.15);
}

.prs-result-count {
  margin: 0;
  justify-self: end;
}

.prs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.prs-card {
  min-height: 132px;
  padding: 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 52%),
    var(--color-bg-panel);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.prs-card:hover,
.prs-card:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(255, 95, 113, 0.36);
  background:
    linear-gradient(180deg, rgba(214, 40, 57, 0.13), transparent 56%),
    var(--color-bg-panel-strong);
}

.prs-card:focus-visible {
  outline: 3px solid rgba(255, 51, 71, 0.45);
  outline-offset: 3px;
}

.prs-card-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--color-accent-soft);
  color: #ffb8c0;
  border: 1px solid rgba(255, 95, 113, 0.22);
  font-weight: 800;
}

.prs-card-content {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.prs-card-content strong {
  font-size: 1.15rem;
}

.prs-card-action {
  grid-column: 2;
  justify-self: start;
  align-self: end;
  color: #ff9aa5;
  font-weight: 800;
  font-size: 0.92rem;
}

.prs-empty {
  padding: 2rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: 18px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
}

.prs-empty h2,
.prs-empty p {
  margin: 0;
}

.prs-empty p {
  margin-top: 0.35rem;
  color: var(--color-text-muted);
}

.prs-card-loading {
  pointer-events: none;
}

.prs-card-loading .prs-card-mark,
.prs-loading-line {
  animation: prs-pulse 1.2s ease-in-out infinite;
}

.prs-loading-line {
  display: block;
  width: 55%;
  height: 0.9rem;
  margin-top: 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.prs-loading-line.wide {
  width: 82%;
  height: 1.15rem;
  margin-top: 0.2rem;
}

@keyframes prs-pulse {
  0%,
  100% {
    opacity: 0.48;
  }

  50% {
    opacity: 1;
  }
}

@media (max-width: 720px) {
  .prs-hero,
  .prs-toolbar {
    grid-template-columns: 1fr;
  }

  .prs-summary {
    width: 100%;
  }

  .prs-result-count {
    justify-self: start;
  }
}
</style>
