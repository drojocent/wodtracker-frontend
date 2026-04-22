import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SidebarMenu from '@/components/SidebarMenu.vue'

const pushMock = vi.fn()
const logoutMock = vi.fn()
const authStoreMock = {
  displayName: 'Dani',
  role: 'ADMIN',
  logout: logoutMock,
}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  RouterLink: defineComponent({
    props: ['to', 'custom'],
    setup(props, { slots }) {
      return () =>
        slots.default?.({
          href: props.to,
          navigate: () => {},
          isActive: true,
          isExactActive: props.to === '/',
        })
    },
  }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('SidebarMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows admin links and closes when logging out', async () => {
    const wrapper = mount(SidebarMenu, {
      props: {
        isMobileOpen: true,
      },
    })

    expect(wrapper.text()).toContain('Gestionar WODs')
    expect(wrapper.text()).toContain('Gestionar Usuarios')
    expect(wrapper.text()).toContain('Benchmarks')
    expect(wrapper.text()).not.toContain('Marcas Personales')
    expect(wrapper.classes()).toContain('sidebar-mobile-open')

    await wrapper.find('.sidebar-logout').trigger('click')

    expect(logoutMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/login')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
