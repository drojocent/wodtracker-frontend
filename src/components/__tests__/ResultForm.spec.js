import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResultForm from '@/components/ResultForm.vue'

describe('ResultForm', () => {
  it('renders edit mode and emits the existing result id', async () => {
    const wrapper = mount(ResultForm, {
      props: {
        wodId: 12,
        initialValue: {
          id: 7,
          result: '05:22',
        },
      },
    })

    expect(wrapper.text()).toContain('Editar marca')
    expect(wrapper.text()).toContain('Actualizar resultado')
    expect(wrapper.find('input').element.value).toBe('05:22')

    await wrapper.find('input').setValue('05:10')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          id: 7,
          wodId: 12,
          result: '05:10',
        },
      ],
    ])
  })

  it('switches back to create mode when there is no existing result', async () => {
    const wrapper = mount(ResultForm, {
      props: {
        wodId: 12,
        initialValue: null,
      },
    })

    expect(wrapper.text()).toContain('Registrar marca')
    expect(wrapper.text()).toContain('Guardar resultado')

    await wrapper.find('input').setValue('04:59')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          id: '',
          wodId: 12,
          result: '04:59',
        },
      ],
    ])
  })
})
