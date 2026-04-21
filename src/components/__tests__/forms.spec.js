import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PersonalRecordForm from '@/components/PersonalRecordForm.vue'
import PRProgressChart from '@/components/PRProgressChart.vue'
import ProfileForm from '@/components/ProfileForm.vue'
import ProposalForm from '@/components/ProposalForm.vue'
import ProposalReviewCard from '@/components/ProposalReviewCard.vue'
import WodCard from '@/components/WodCard.vue'
import WodForm from '@/components/WodForm.vue'

describe('additional form and card components', () => {
  it('emits profile payloads based on the current profile', async () => {
    const wrapper = mount(ProfileForm, {
      props: {
        profile: {
          name: 'Dani',
          email: 'dani@example.com',
          weight: 80,
          height: 180,
        },
      },
    })

    await wrapper.find('#profile-name').setValue('Daniel')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')[0][0]).toEqual({
      name: 'Daniel',
      weight: 80,
      height: 180,
    })
  })

  it('emits proposal payloads with the selected format', async () => {
    const wrapper = mount(ProposalForm)

    await wrapper.find('#proposal-title').setValue('Open Prep')
    await wrapper.find('#proposal-type').setValue('AMRAP')
    await wrapper.find('#proposal-description').setValue('Workout')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')[0][0]).toEqual({
      name: 'Open Prep',
      title: 'Open Prep',
      type: 'AMRAP',
      description: 'Workout',
    })
  })

  it('renders proposal review details and emits moderation actions', async () => {
    const wrapper = mount(ProposalReviewCard, {
      props: {
        proposal: {
          name: 'Open Prep',
          type: 'EMOM',
          authorName: 'Dani',
          description: 'Workout',
        },
      },
    })

    expect(wrapper.text()).toContain('Dani')
    await wrapper.findAll('button')[0].trigger('click')
    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('reject')).toBeTruthy()
  })

  it('renders wod cards and wod form payloads', async () => {
    const card = mount(WodCard, {
      props: {
        wod: {
          name: 'Fran',
          description: '21-15-9',
          type: 'FOR_TIME',
          date: '2026-04-20',
        },
      },
    })

    expect(card.text()).toContain('Fran')
    expect(card.text()).toContain('FOR_TIME')

    const form = mount(WodForm, {
      props: {
        initialValue: {
          id: 5,
          name: 'Murph',
          type: 'AMRAP',
          date: '2026-04-20',
          description: 'Hero wod',
        },
      },
    })

    await form.find('#wod-title').setValue('Murph 2')
    await form.find('form').trigger('submit.prevent')

    expect(form.emitted('submit')[0][0]).toMatchObject({
      name: 'Murph 2',
      type: 'AMRAP',
      approved: true,
    })
  })

  it('emits personal record payloads and renders the progress chart', async () => {
    const form = mount(PersonalRecordForm)

    await form.find('#pr-weight').setValue('120.5')
    await form.find('form').trigger('submit.prevent')

    expect(form.emitted('submit')[0][0]).toEqual({
      weight: 120.5,
    })

    const chart = mount(PRProgressChart, {
      props: {
        history: [
          { id: 1, weight: 100, createdAt: '2026-04-18T10:00:00' },
          { id: 2, weight: 110, createdAt: '2026-04-20T10:00:00' },
        ],
      },
    })

    expect(chart.find('polyline').exists()).toBe(true)
    expect(chart.text()).toContain('100 kg')
    expect(chart.text()).toContain('110 kg')
    expect(chart.text()).toContain('Mejor marca:')
    expect(chart.text()).toContain('18/4')
    expect(chart.text()).toContain('20/4')
  })
})
