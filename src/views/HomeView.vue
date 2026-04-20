<template>
  <div class="content-grid">
    <section class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <div v-if="wodStore.isLoadingTodayWod" class="panel-card">
        Cargando el WOD del día...
      </div>

      <WodCard v-else-if="wodStore.todayWod" :wod="wodStore.todayWod" />

      <div v-else class="panel-card empty-state">
        <h2>No hay WOD disponible</h2>
        <p>Cuando el backend publique el entrenamiento de hoy, aparecerá aquí.</p>
      </div>
    </section>

    <aside class="content-column side-column">
      <ResultForm
        :wod-id="wodIdentifier"
        :initial-value="currentTodayResult"
        :loading="wodStore.isSubmittingResult"
        @submit="handleSubmitResult"
      />

      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Historial</p>
            <h2>Últimos resultados</h2>
          </div>
        </div>

        <p v-if="userStore.isLoadingResults" class="muted-text">Cargando resultados...</p>
        <ul v-else-if="recentResults.length" class="results-list">
          <li v-for="result in recentResults" :key="result.id || result.createdAt || result.result">
            <strong>{{ result.wodName || 'WOD sin nombre' }}</strong>
            <span>{{ result.wodDescription || 'Sin descripción disponible.' }}</span>
            <span><strong>Tu resultado:</strong> {{ result.result || 'Sin marca' }}</span>
            <span>{{ formatResultMeta(result) }}</span>
          </li>
        </ul>
        <p v-else class="muted-text">Todavía no has guardado resultados.</p>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ResultForm from '@/components/ResultForm.vue'
import WodCard from '@/components/WodCard.vue'
import { useUserStore } from '@/stores/userStore'
import { useWodStore } from '@/stores/wodStore'

const wodStore = useWodStore()
const userStore = useUserStore()

const errorMessage = ref('')
const successMessage = ref('')

const wodIdentifier = computed(
  () => wodStore.todayWod?.id || wodStore.todayWod?.wodId || wodStore.todayWod?._id || '',
)
const recentResults = computed(() => userStore.results.slice(0, 5))
const currentTodayResult = computed(() =>
  userStore.results.find((result) => {
    const resultWodId = result?.wodId || result?.wod?.id || result?.wod?._id
    return String(resultWodId || '') === String(wodIdentifier.value || '')
  }) || null,
)

onMounted(async () => {
  await Promise.allSettled([wodStore.loadTodayWod(), userStore.loadResults()])
})

async function handleSubmitResult(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (payload.id) {
      const currentValue = String(currentTodayResult.value?.result || '').trim()
      const nextValue = String(payload.result || '').trim()

      if (currentValue === nextValue) {
        successMessage.value = 'No hay cambios en el resultado.'
        return
      }

      await wodStore.updateResult(payload.id, payload)
      successMessage.value = 'Resultado actualizado correctamente.'
    } else {
      await wodStore.createResult(payload)
      successMessage.value = 'Resultado guardado correctamente.'
    }
    await userStore.loadResults()
  } catch (error) {
    errorMessage.value = error.message
  }
}

function formatResultMeta(result) {
  const dateValue = result?.createdAt || result?.date

  if (!dateValue) {
    return 'Resultado registrado'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}
</script>
