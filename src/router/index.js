import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ProposalView from '@/views/ProposalView.vue'
import TimerView from '@/views/TimerView.vue'
import AdminWodsView from '@/views/AdminWodsView.vue'
import AdminProposalsView from '@/views/AdminProposalsView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { public: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: 'proposal',
        name: 'proposal',
        component: ProposalView,
        meta: { requiresAuth: true, roles: ['USER'] },
      },
      {
        path: 'timer',
        name: 'timer',
        component: TimerView,
        meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      },
      {
        path: 'admin/wods',
        name: 'admin-wods',
        component: AdminWodsView,
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
      {
        path: 'admin/proposals',
        name: 'admin-proposals',
        component: AdminProposalsView,
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!authStore.isHydrated) {
    authStore.hydrateAuth()
  }

  if (to.meta.public && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  const allowedRoles = Array.isArray(to.meta.roles) ? to.meta.roles : []

  if (allowedRoles.length && !allowedRoles.includes(authStore.role)) {
    return { name: 'home' }
  }

  return true
})

export default router
