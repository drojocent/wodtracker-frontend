import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const wodStoreMock = {
  todayWod: { id: 1, name: 'Fran', description: 'Workout', type: 'FOR_TIME', date: '2026-04-20' },
  allWods: [],
  proposals: [],
  isLoadingTodayWod: false,
  isSubmittingResult: false,
  isSubmittingProposal: false,
  isLoadingAllWods: false,
  isSavingWod: false,
  isDeletingWod: false,
  isLoadingProposals: false,
  isModeratingProposal: false,
  loadTodayWod: vi.fn(),
  createResult: vi.fn(),
  updateResult: vi.fn(),
  createProposal: vi.fn(),
  loadAllWods: vi.fn(),
  saveWod: vi.fn(),
  removeWod: vi.fn(),
  loadPendingProposals: vi.fn(),
  moderateProposal: vi.fn(),
}

const userStoreMock = {
  profile: null,
  results: [],
  isLoadingProfile: false,
  isLoadingResults: false,
  loadProfile: vi.fn(),
  updateProfile: vi.fn(),
  loadResults: vi.fn(),
}

const authStoreMock = {
  user: { id: 7, name: 'Dani', email: 'dani@example.com' },
  role: 'ADMIN',
}

const benchmarkStoreMock = {
  benchmarks: [],
  currentBenchmark: null,
  myResults: [],
  isLoadingBenchmarks: false,
  isLoadingBenchmark: false,
  isSavingBenchmark: false,
  isDeletingBenchmark: false,
  isSubmittingResult: false,
  isLoadingMyResults: false,
  setCurrentBenchmark: vi.fn(),
  loadBenchmarks: vi.fn(),
  loadBenchmarkById: vi.fn(),
  saveBenchmark: vi.fn(),
  removeBenchmark: vi.fn(),
  createResult: vi.fn(),
  loadMyResults: vi.fn(),
}

const getUserByIdMock = vi.fn()

vi.mock('@/stores/wodStore', () => ({
  useWodStore: () => wodStoreMock,
}))

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('@/stores/benchmarkStore', () => ({
  useBenchmarkStore: () => benchmarkStoreMock,
}))

vi.mock('@/services/userService', () => ({
  default: {
    getUserById: getUserByIdMock,
  },
}))

const ResultFormStub = defineComponent({
  props: ['initialValue', 'wodId', 'loading'],
  emits: ['submit'],
  template: '<button class="result-submit" @click="$emit(\'submit\', { id: initialValue?.id || \'\', wodId, result: \'04:20\' })">submit</button>',
})

const ProposalFormStub = defineComponent({
  emits: ['submit'],
  template: '<button class="proposal-submit" @click="$emit(\'submit\', { name: \'Open\', type: \'AMRAP\', description: \'Desc\' })">proposal</button>',
})

const ProfileFormStub = defineComponent({
  emits: ['submit'],
  template: '<button class="profile-submit" @click="$emit(\'submit\', { name: \'Daniel\' })">profile</button>',
})

const PasswordChangeFormStub = defineComponent({
  emits: ['submit'],
  template: '<button class="password-submit" @click="$emit(\'submit\', { password: \'secret123\' })">password</button>',
})

const WodFormStub = defineComponent({
  props: ['initialValue'],
  emits: ['submit', 'cancel'],
  template: '<div><button class="wod-submit" @click="$emit(\'submit\', { name: \'Murph\', type: \'FOR_TIME\', date: \'2026-04-20\', description: \'Hero\' })">save</button><button class="wod-cancel" @click="$emit(\'cancel\')">cancel</button></div>',
})

const ProposalReviewCardStub = defineComponent({
  props: ['proposal'],
  emits: ['approve', 'reject'],
  template: '<div class="proposal-card">{{ proposal.authorName }}<button class="approve" @click="$emit(\'approve\')">approve</button><button class="reject" @click="$emit(\'reject\')">reject</button></div>',
})

const BenchmarkFormStub = defineComponent({
  emits: ['submit', 'cancel'],
  template: '<div><button class="benchmark-save" @click="$emit(\'submit\', { name: \'Fran\', description: \'Workout\', type: \'FOR_TIME\' })">save</button><button class="benchmark-cancel" @click="$emit(\'cancel\')">cancel</button></div>',
})

const BenchmarkResultFormStub = defineComponent({
  emits: ['submit'],
  template: '<button class="benchmark-result-submit" @click="$emit(\'submit\', { result: \'03:50\' })">save result</button>',
})

describe('dashboard views', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wodStoreMock.todayWod = { id: 1, name: 'Fran', description: 'Workout', type: 'FOR_TIME', date: '2026-04-20' }
    wodStoreMock.allWods = []
    wodStoreMock.proposals = []
    userStoreMock.profile = null
    userStoreMock.results = []
    benchmarkStoreMock.benchmarks = []
    benchmarkStoreMock.currentBenchmark = null
    benchmarkStoreMock.myResults = []
    getUserByIdMock.mockResolvedValue({ name: 'Dani' })
  })

  it('home view updates the existing result instead of creating a new one', async () => {
    userStoreMock.results = [{ id: 9, wodId: 1, result: '04:30', wodName: 'Fran', wodDescription: 'Workout' }]
    const HomeView = (await import('@/views/HomeView.vue')).default
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          ResultForm: ResultFormStub,
          WodCard: true,
        },
      },
    })

    await wrapper.find('.result-submit').trigger('click')

    expect(wodStoreMock.updateResult).toHaveBeenCalledWith(9, { id: 9, wodId: 1, result: '04:20' })
    expect(wodStoreMock.createResult).not.toHaveBeenCalled()
  })

  it('proposal and profile views handle success flows', async () => {
    const ProposalView = (await import('@/views/ProposalView.vue')).default
    const proposalWrapper = mount(ProposalView, {
      global: { stubs: { ProposalForm: ProposalFormStub } },
    })
    await proposalWrapper.find('.proposal-submit').trigger('click')
    expect(wodStoreMock.createProposal).toHaveBeenCalled()
    expect(proposalWrapper.text()).toContain('Tu propuesta se ha enviado correctamente.')

    userStoreMock.profile = { name: 'Dani', email: 'dani@example.com' }
    const ProfileView = (await import('@/views/ProfileView.vue')).default
    const profileWrapper = mount(ProfileView, {
      global: {
        stubs: {
          ProfileForm: ProfileFormStub,
          PasswordChangeForm: PasswordChangeFormStub,
        },
      },
    })

    await profileWrapper.find('.profile-submit').trigger('click')
    await profileWrapper.find('.password-submit').trigger('click')
    expect(userStoreMock.updateProfile).toHaveBeenCalled()
  })

  it('admin wods view sorts by date and handles create/delete actions', async () => {
    wodStoreMock.allWods = [
      { id: 2, name: 'Murph', type: 'AMRAP', date: '2026-04-22' },
      { id: 1, name: 'Fran', type: 'FOR_TIME', date: '2026-04-20' },
    ]
    const AdminWodsView = (await import('@/views/AdminWodsView.vue')).default
    const wrapper = mount(AdminWodsView, {
      global: {
        stubs: {
          WodForm: WodFormStub,
        },
      },
    })

    expect(wrapper.text().indexOf('Fran')).toBeLessThan(wrapper.text().indexOf('Murph'))

    await wrapper.find('.wod-submit').trigger('click')
    expect(wodStoreMock.saveWod).toHaveBeenCalled()

    await wrapper.findAll('button')[1].trigger('click')
    expect(wodStoreMock.removeWod).toHaveBeenCalled()
  })

  it('admin proposals view resolves author names and moderates proposals', async () => {
    wodStoreMock.proposals = [{ id: 1, userId: 7, name: 'Open Prep', description: 'Workout', type: 'AMRAP' }]
    const AdminProposalsView = (await import('@/views/AdminProposalsView.vue')).default
    const wrapper = mount(AdminProposalsView, {
      global: {
        stubs: {
          ProposalReviewCard: ProposalReviewCardStub,
        },
      },
    })

    await flushPromises()
    await nextTick()

    expect(getUserByIdMock).toHaveBeenCalledWith(7)

    await wrapper.find('.approve').trigger('click')
    expect(wodStoreMock.moderateProposal).toHaveBeenCalledWith(1, 'approve')
  })

  it('renders timer view', async () => {
    const TimerView = (await import('@/views/TimerView.vue')).default
    const wrapper = mount(TimerView, {
      global: {
        stubs: {
          Timer: { template: '<div class="timer-stub">timer</div>' },
        },
      },
    })

    expect(wrapper.find('.timer-stub').exists()).toBe(true)
  })

  it('benchmarks view lists entries and allows admin save/delete actions', async () => {
    benchmarkStoreMock.benchmarks = [
      { id: 2, name: 'Murph', type: 'FOR_TIME', createdAt: '2026-04-19T10:00:00' },
      { id: 1, name: 'Fran', type: 'FOR_TIME', createdAt: '2026-04-20T10:00:00' },
    ]

    const BenchmarksView = (await import('@/views/BenchmarksView.vue')).default
    const wrapper = mount(BenchmarksView, {
      global: {
        stubs: {
          BenchmarkForm: BenchmarkFormStub,
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(benchmarkStoreMock.loadBenchmarks).toHaveBeenCalled()
    expect(wrapper.text().indexOf('Fran')).toBeLessThan(wrapper.text().indexOf('Murph'))

    await wrapper.find('.benchmark-save').trigger('click')
    expect(benchmarkStoreMock.saveBenchmark).toHaveBeenCalled()

    await wrapper.find('.danger-button').trigger('click')
    expect(benchmarkStoreMock.removeBenchmark).toHaveBeenCalledWith(1)
  })

  it('benchmark detail view saves result and lets admin edit/delete', async () => {
    benchmarkStoreMock.currentBenchmark = {
      id: 1,
      name: 'Fran',
      description: 'Workout',
      type: 'FOR_TIME',
      createdAt: '2026-04-20T10:00:00',
    }
    benchmarkStoreMock.myResults = [{ id: 4, result: '03:55', createdAt: '2026-04-20T12:00:00' }]

    const pushMock = vi.fn()
    vi.doMock('vue-router', async () => {
      const actual = await vi.importActual('vue-router')
      return {
        ...actual,
        useRoute: () => ({ params: { id: '1' } }),
        useRouter: () => ({ push: pushMock }),
      }
    })

    const BenchmarkDetailView = (await import('@/views/BenchmarkDetailView.vue?test=' + Date.now())).default
    const wrapper = mount(BenchmarkDetailView, {
      global: {
        stubs: {
          BenchmarkForm: BenchmarkFormStub,
          BenchmarkResultForm: BenchmarkResultFormStub,
        },
      },
    })

    expect(benchmarkStoreMock.loadBenchmarkById).toHaveBeenCalledWith('1')
    expect(benchmarkStoreMock.loadMyResults).toHaveBeenCalledWith('1')

    await wrapper.find('.benchmark-result-submit').trigger('click')
    expect(benchmarkStoreMock.createResult).toHaveBeenCalledWith('1', { result: '03:50' })

    await wrapper.find('.secondary-button').trigger('click')
    await wrapper.find('.benchmark-save').trigger('click')
    expect(benchmarkStoreMock.saveBenchmark).toHaveBeenCalledWith(
      { name: 'Fran', description: 'Workout', type: 'FOR_TIME' },
      '1',
    )

    await wrapper.find('.danger-button').trigger('click')
    expect(benchmarkStoreMock.removeBenchmark).toHaveBeenCalledWith('1')
    expect(pushMock).toHaveBeenCalledWith({ name: 'benchmarks' })
  })
})
