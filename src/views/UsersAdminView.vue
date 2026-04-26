<template>
  <section class="content-grid">
    <div class="content-column">
      <section class="panel-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Usuarios</p>
            <h2>Listado de usuarios</h2>
          </div>
          <button
            class="user-create-shortcut"
            type="button"
            aria-label="Ir al formulario de crear usuario"
            title="Crear usuario"
            @click="scrollToUserForm"
          >
            +
          </button>
        </div>

        <p v-if="isLoadingUsers" class="muted-text">Cargando usuarios...</p>

        <div v-else class="users-list-content">
          <div class="user-search-filter field-group">
            <label for="user-name-search">Buscar por nombre</label>
            <input
              id="user-name-search"
              v-model.trim="searchTerm"
              type="search"
              placeholder="Nombre de usuario"
              autocomplete="off"
            />
          </div>

          <div class="user-role-filter field-group">
            <label for="user-role-filter">Rol</label>
            <select id="user-role-filter" v-model="selectedRole">
              <option value="">Todos</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div v-if="sortedUsers.length" class="admin-list">
            <article v-for="user in sortedUsers" :key="getUserId(user)" class="admin-item">
              <div>
                <strong>{{ user.name || 'Usuario sin nombre' }}</strong>
                <p>{{ user.email || 'Email no definido' }} · {{ user.role || 'USER' }}</p>
              </div>

              <div class="inline-actions">
                <button
                  v-if="!isCurrentUser(user)"
                  class="secondary-button align-start danger-button"
                  type="button"
                  :disabled="isDeletingUser"
                  @click="handleDeleteUser(user)"
                >
                  Eliminar
                </button>
              </div>
            </article>
          </div>

          <p v-else class="muted-text">{{ emptyUsersMessage }}</p>
        </div>
      </section>
    </div>

    <aside ref="userFormSection" class="content-column side-column">
      <div v-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="status-message success">
        {{ successMessage }}
      </div>

      <UserAdminForm :key="formResetKey" :loading="isCreatingUser" @submit="handleCreateUser" />
    </aside>

    <div
      v-if="userPendingDeletion"
      class="timer-finished users-delete-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
      aria-describedby="delete-user-description"
    >
      <div class="timer-finished-panel">
        <p class="eyebrow">Usuarios</p>
        <h2 id="delete-user-title">Eliminar usuario</h2>
        <p id="delete-user-description">¿Seguro que quieres eliminar este usuario definitivamente?</p>
        <div class="inline-actions modal-actions">
          <button
            class="secondary-button align-start"
            type="button"
            :disabled="isDeletingUser"
            @click="cancelDeleteUser"
          >
            Cancelar
          </button>
          <button
            class="primary-button align-start"
            type="button"
            :disabled="isDeletingUser"
            @click="confirmDeleteUser"
          >
            {{ isDeletingUser ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import UserAdminForm from '@/components/UserAdminForm.vue'
import userService from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const users = ref([])
const userFormSection = ref(null)
const isLoadingUsers = ref(false)
const isCreatingUser = ref(false)
const isDeletingUser = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const formResetKey = ref(0)
const userPendingDeletion = ref(null)
const searchTerm = ref('')
const selectedRole = ref('')

const filteredUsers = computed(() => {
  const normalizedSearch = normalizeText(searchTerm.value)

  return users.value.filter((user) => {
    const matchesRole = !selectedRole.value || (user.role || 'USER') === selectedRole.value
    const matchesSearch = !normalizedSearch || normalizeText(getUserName(user)).includes(normalizedSearch)

    return matchesRole && matchesSearch
  })
})
const sortedUsers = computed(() =>
  [...filteredUsers.value].sort((left, right) => getUserName(left).localeCompare(getUserName(right), 'es')),
)
const emptyUsersMessage = computed(() =>
  users.value.length ? 'No hay usuarios que coincidan con los filtros.' : 'Todavía no hay usuarios registrados.',
)

onMounted(loadUsers)

async function loadUsers() {
  isLoadingUsers.value = true
  errorMessage.value = ''

  try {
    const data = await userService.getAdminUsers()
    users.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoadingUsers.value = false
  }
}

async function handleCreateUser(payload) {
  errorMessage.value = ''
  successMessage.value = ''
  isCreatingUser.value = true

  try {
    await userService.createAdminUser(payload)
    successMessage.value = 'Usuario creado correctamente. Se ha enviado una contraseña temporal por email.'
    formResetKey.value += 1
    await loadUsers()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isCreatingUser.value = false
  }
}

function handleDeleteUser(user) {
  const userId = getUserId(user)

  if (!userId) {
    errorMessage.value = 'No se ha podido identificar el usuario.'
    return
  }

  userPendingDeletion.value = user
}

function cancelDeleteUser() {
  userPendingDeletion.value = null
}

async function confirmDeleteUser() {
  const userId = getUserId(userPendingDeletion.value)

  if (!userId) {
    errorMessage.value = 'No se ha podido identificar el usuario.'
    userPendingDeletion.value = null
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isDeletingUser.value = true

  try {
    await userService.deleteAdminUser(userId)
    successMessage.value = 'Usuario eliminado correctamente.'
    userPendingDeletion.value = null
    await loadUsers()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isDeletingUser.value = false
  }
}

function getUserId(user) {
  return user?.id || user?._id || user?.userId || ''
}

function isCurrentUser(user) {
  const currentUserId = authStore.user?.id || authStore.user?._id || authStore.user?.userId || ''
  return String(getUserId(user)) === String(currentUserId)
}

function getUserName(user) {
  return user?.name || user?.fullName || user?.username || ''
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function scrollToUserForm() {
  userFormSection.value?.scrollIntoView?.({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<style scoped>
.user-create-shortcut {
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

.user-create-shortcut:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.user-create-shortcut:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(214, 40, 57, 0.18);
}

@media (max-width: 720px) {
  .user-create-shortcut {
    display: inline-grid;
  }
}

.users-delete-modal {
  position: fixed;
  z-index: 60;
}

.modal-actions {
  justify-content: center;
}

.users-list-content {
  display: grid;
  gap: 1rem;
}

.user-search-filter,
.user-role-filter {
  width: min(100%, 260px);
  margin-bottom: 0;
}
</style>
