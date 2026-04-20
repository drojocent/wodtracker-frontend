<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-brand">
      <span class="sidebar-kicker">CrossFit App</span>
      <h2>WODTracker</h2>
      <p>Controla tu entrenamiento diario y tu progreso sin salir del panel.</p>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ href, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          class="sidebar-link"
          :class="{ active: item.to === '/' ? isExactActive : isActive }"
          @click="handleNavigate(navigate)"
        >
          <span>{{ item.label }}</span>
        </a>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <strong>{{ authStore.displayName }}</strong>
        <span>{{ authStore.role || 'USER' }}</span>
      </div>

      <button class="secondary-button sidebar-logout" type="button" @click="handleLogout">
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { to: '/', label: 'Inicio', roles: ['USER', 'ADMIN'] },
  { to: '/profile', label: 'Perfil', roles: ['USER', 'ADMIN'] },
  { to: '/proposal', label: 'Proponer WOD', roles: ['USER'] },
  { to: '/timer', label: 'Cronómetro', roles: ['USER', 'ADMIN'] },
  { to: '/admin/wods', label: 'Gestionar WODs', roles: ['ADMIN'] },
  { to: '/admin/proposals', label: 'Propuestas', roles: ['ADMIN'] },
]

const visibleItems = computed(() =>
  navItems.filter((item) => item.roles.includes(authStore.role || 'USER')),
)

function handleLogout() {
  authStore.logout()
  emit('close')
  router.push('/login')
}

function handleNavigate(navigate) {
  navigate()
  emit('close')
}
</script>
