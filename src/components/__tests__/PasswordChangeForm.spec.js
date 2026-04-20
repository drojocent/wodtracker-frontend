import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PasswordChangeForm from '@/components/PasswordChangeForm.vue'

describe('PasswordChangeForm', () => {
  it('shows a validation error when passwords do not match', async () => {
    const wrapper = mount(PasswordChangeForm)
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('secret123')
    await inputs[1].setValue('different456')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('La nueva contraseña y su confirmación deben coincidir.')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('emits the new password and clears the form when valid', async () => {
    const wrapper = mount(PasswordChangeForm)
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('secret123')
    await inputs[1].setValue('secret123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([[{ password: 'secret123' }]])
    expect(inputs[0].element.value).toBe('')
    expect(inputs[1].element.value).toBe('')
  })
})
