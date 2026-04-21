<template>
  <section class="content-grid">
    <div class="content-column">
      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">WODs</p>
            <h2>Listado de entrenamientos</h2>
          </div>
          <button
            class="wod-create-shortcut"
            type="button"
            aria-label="Ir al formulario de crear WOD"
            title="Crear WOD"
            @click="scrollToWodForm"
          >
            +
          </button>
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

    <aside ref="wodFormSection" class="content-column side-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

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
import { computed, nextTick, onMounted, ref } from 'vue'
import WodForm from '@/components/WodForm.vue'
import { useWodStore } from '@/stores/wodStore'

const wodStore = useWodStore()

const editingWod = ref(null)
const wodFormSection = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const scrollPositionBeforeEdit = ref(null)

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
  const wasEditing = Boolean(editingWod.value)

  try {
    await wodStore.saveWod(payload, getWodId(editingWod.value))
    successMessage.value = editingWod.value
      ? 'WOD actualizado correctamente.'
      : 'WOD creado correctamente.'
    editingWod.value = null

    if (wasEditing) {
      await restoreScrollPosition()
    }
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

async function startEditing(wod) {
  scrollPositionBeforeEdit.value = getCurrentScrollY()
  editingWod.value = { ...wod }
  await nextTick()
  scrollToWodForm()
}

function cancelEditing() {
  editingWod.value = null
  scrollPositionBeforeEdit.value = null
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

function scrollToWodForm() {
  wodFormSection.value?.scrollIntoView?.({
    behavior: 'smooth',
    block: 'start',
  })
}

async function restoreScrollPosition() {
  await nextTick()

  if (typeof window !== 'undefined' && scrollPositionBeforeEdit.value !== null) {
    window.scrollTo({
      top: scrollPositionBeforeEdit.value,
      behavior: 'smooth',
    })
  }

  scrollPositionBeforeEdit.value = null
}

function getCurrentScrollY() {
  return typeof window === 'undefined' ? 0 : window.scrollY
}
</script>

<style scoped>
.wod-create-shortcut {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 95, 113, 0.34);
  border-radius: 999px;
  background: var(--color-accent);
  color: #ffffff;
  display: none;
  place-items: center;
  flex: 0 0 auto;
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(214, 40, 57, 0.18);
}

.wod-create-shortcut:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.wod-create-shortcut:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(214, 40, 57, 0.18);
}

@media (max-width: 720px) {
  .wod-create-shortcut {
    display: inline-grid;
  }
}
</style>
