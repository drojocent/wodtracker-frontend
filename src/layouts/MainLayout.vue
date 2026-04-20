<template>
  <div class="dashboard-layout">
    <button class="mobile-menu-button" type="button" @click="isMenuOpen = !isMenuOpen">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div
      v-if="isMenuOpen"
      class="mobile-menu-backdrop"
      @click="isMenuOpen = false"
    ></div>

    <SidebarMenu
      :is-mobile-open="isMenuOpen"
      @close="isMenuOpen = false"
    />

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">WODTracker</p>
          <h1>{{ currentTitle }}</h1>
        </div>

        <div class="header-user">
          <span>{{ authStore.displayName }}</span>
          <small>{{ authStore.role || 'USER' }}</small>
        </div>
      </header>

      <section class="dashboard-content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SidebarMenu from '@/components/SidebarMenu.vue'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

const titles = {
  home: 'Resumen diario',
  profile: 'Mi perfil',
  proposal: 'Proponer WOD',
  timer: 'Cronómetro',
  'admin-wods': 'Administrar WODs',
  'admin-proposals': 'Propuestas pendientes',
}

const currentTitle = computed(() => titles[route.name] || 'Panel')

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  },
)
</script>
