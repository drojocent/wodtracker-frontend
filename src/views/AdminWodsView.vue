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
            <p class="eyebrow">WODs</p>
            <h2>Listado de entrenamientos</h2>
          </div>
        </div>

        <p v-if="wodStore.isLoadingAllWods" class="muted-text">Cargando WODs...</p>

        <div v-else-if="wods.length" class="admin-list">
          <article v-for="wod in wods" :key="getWodId(wod)" class="admin-item">
            <div>
              <strong>{{ wod.title || wod.name }}</strong>
              <p>{{ wod.type || wod.format || 'Formato no definido' }} · {{ formatDate(wod.date || wod.scheduledDate) }}</p>
            </div>

            <div class="inline-actions">
              <button class="secondary-button align-start" type="button" @click="startEditing(wod)">
                Editar
              </button>
              <button
                class="secondary-button align-start danger-button"
                type="button"
                :disabled="wodStore.isDeletingWod"
                @click="handleDeleteWod(wod)"
              >
                Eliminar
              </button>
            </div>
          </article>
        </div>

        <p v-else class="muted-text">Todavía no hay WODs registrados.</p>
      </section>
    </div>

    <aside class="content-column side-column">
      <WodForm
        :initial-value="editingWod"
        :loading="wodStore.isSavingWod"
        @cancel="cancelEditing"
        @submit="handleSaveWod"
      />
    </aside>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import WodForm from '@/components/WodForm.vue'
import { useWodStore } from '@/stores/wodStore'

const wodStore = useWodStore()

const editingWod = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const wods = computed(() =>
  [...wodStore.allWods].sort((left, right) => compareWodDates(left, right)),
)

onMounted(async () => {
  try {
    await wodStore.loadAllWods()
  } catch (error) {
    errorMessage.value = error.message
  }
})

async function handleSaveWod(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await wodStore.saveWod(payload, getWodId(editingWod.value))
    successMessage.value = editingWod.value
      ? 'WOD actualizado correctamente.'
      : 'WOD creado correctamente.'
    editingWod.value = null
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handleDeleteWod(wod) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await wodStore.removeWod(getWodId(wod))
    successMessage.value = 'WOD eliminado correctamente.'

    if (getWodId(editingWod.value) === getWodId(wod)) {
      editingWod.value = null
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}

function startEditing(wod) {
  editingWod.value = { ...wod }
}

function cancelEditing() {
  editingWod.value = null
}

function getWodId(wod) {
  return wod?.id || wod?._id || wod?.wodId || ''
}

function formatDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function compareWodDates(left, right) {
  const leftValue = left?.date || left?.scheduledDate || ''
  const rightValue = right?.date || right?.scheduledDate || ''

  if (!leftValue && !rightValue) {
    return 0
  }

  if (!leftValue) {
    return 1
  }

  if (!rightValue) {
    return -1
  }

  return new Date(leftValue).getTime() - new Date(rightValue).getTime()
}
</script>
