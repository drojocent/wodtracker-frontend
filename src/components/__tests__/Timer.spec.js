import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Timer from '@/components/Timer.vue'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs a descending countdown for FOR_TIME', async () => {
    const wrapper = mount(Timer)
    const timeInput = wrapper.find('#timer-duration')

    await timeInput.setValue('00:03')
    await wrapper.find('.primary-button').trigger('click')

    expect(wrapper.text()).toContain('00:00:03')

    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.text()).toContain('00:00:02')
  })

  it('handles EMOM work and rest intervals', async () => {
    const wrapper = mount(Timer)

    await wrapper.find('#timer-mode').setValue('EMOM')
    await wrapper.find('#emom-intervals').setValue('2')
    await wrapper.find('#emom-interval-duration').setValue('00:02')
    await wrapper.find('#emom-rest-duration').setValue('00:01')
    await wrapper.find('.primary-button').trigger('click')

    expect(wrapper.text()).toContain('Trabajo')
    expect(wrapper.text()).toContain('Ronda 1/2')
    expect(wrapper.text()).toContain('00:00:02')

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.text()).toContain('Descanso')
    expect(wrapper.text()).toContain('Ronda 2/2')
    expect(wrapper.text()).toContain('00:00:01')

    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.text()).toContain('Trabajo')
    expect(wrapper.text()).toContain('Ronda 2/2')
    expect(wrapper.text()).toContain('00:00:02')
  })
})
