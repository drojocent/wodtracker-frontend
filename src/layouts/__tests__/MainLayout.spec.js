import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MainLayout from '@/layouts/MainLayout.vue'

const routeMock = { name: 'profile', fullPath: '/profile' }
const authStoreMock = {
  displayName: 'Dani',
  role: 'ADMIN',
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('MainLayout', () => {
  beforeEach(() => {
    routeMock.name = 'profile'
    routeMock.fullPath = '/profile'
  })

  it('renders the current section title and opens the mobile menu', async () => {
    const wrapper = mount(MainLayout, {
      global: {
        stubs: {
          SidebarMenu: {
            template: '<div class="sidebar-stub">{{ isMobileOpen }}</div>',
            props: ['isMobileOpen'],
          },
          RouterView: {
            template: '<div class="router-view-stub" />',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Mi perfil')
    expect(wrapper.text()).toContain('Dani')

    await wrapper.find('.mobile-menu-button').trigger('click')
    expect(wrapper.find('.sidebar-stub').text()).toBe('true')
  })
})
