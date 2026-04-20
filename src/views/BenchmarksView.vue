<template>
  <section class="content-grid">
    <div class="content-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Benchmarks</p>
            <h2>Listado de benchmarks</h2>                               
              <p>Descubre los WODs más famosos de la historia</p>      
          </div>
        </div>

        <p v-if="benchmarkStore.isLoadingBenchmarks" class="muted-text">Cargando benchmarks...</p>

        <div v-else-if="benchmarks.length" class="admin-list">
          <article v-for="benchmark in benchmarks" :key="getBenchmarkId(benchmark)" class="admin-item">
            <div>
              <RouterLink
                class="helper-link"
                :to="{ name: 'benchmark-detail', params: { id: getBenchmarkId(benchmark) } }"
              >
                {{ benchmark.name || benchmark.title }}
              </RouterLink>
              <p>
                {{ benchmark.type || 'Sin tipo' }}
              </p>
            </div>

            <div class="inline-actions">
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
        </div>

        <p v-else class="muted-text">Todavia no hay benchmarks registrados.</p>
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

const isAdmin = computed(() => authStore.role === 'ADMIN')
const benchmarks = computed(() =>
  [...benchmarkStore.benchmarks].sort((left, right) => compareDates(right?.createdAt, left?.createdAt)),
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
</script>
