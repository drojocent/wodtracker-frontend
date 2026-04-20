import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const pushMock = vi.fn()
const routeMock = { query: {} }
const loginMock = vi.fn()
const registerMock = vi.fn()
const authStoreMock = {
  login: loginMock,
  register: registerMock,
}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => routeMock,
  RouterLink: defineComponent({
    template: '<a><slot /></a>',
  }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('auth views', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeMock.query = {}
  })

  it('logs in and redirects to the requested route', async () => {
    const LoginView = (await import('@/views/LoginView.vue')).default
    loginMock.mockResolvedValue(undefined)
    routeMock.query = { redirect: '/timer' }

    const wrapper = mount(LoginView)
    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(loginMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(pushMock).toHaveBeenCalledWith('/timer')
  })

  it('shows login errors', async () => {
    const LoginView = (await import('@/views/LoginView.vue')).default
    loginMock.mockRejectedValue(new Error('Credenciales invalidas'))

    const wrapper = mount(LoginView)
    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('#password').setValue('bad')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Credenciales invalidas')
  })

  it('shows registration success feedback in login', async () => {
    const LoginView = (await import('@/views/LoginView.vue')).default
    routeMock.query = { registered: '1' }

    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('Cuenta creada correctamente')
  })

  it('registers a user and redirects to login', async () => {
    const RegisterView = (await import('@/views/RegisterView.vue')).default
    registerMock.mockResolvedValue(undefined)

    const wrapper = mount(RegisterView)
    await wrapper.find('#name').setValue('Dani')
    await wrapper.find('#register-email').setValue('dani@example.com')
    await wrapper.find('#register-password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith({
      name: 'login',
      query: { registered: '1' },
    })
  })
})
