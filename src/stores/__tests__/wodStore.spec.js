import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const getTodayWodMock = vi.fn()
const getAllWodsMock = vi.fn()
const createWodMock = vi.fn()
const updateWodMock = vi.fn()
const deleteWodMock = vi.fn()
const createResultMock = vi.fn()
const updateResultMock = vi.fn()
const createProposalMock = vi.fn()
const getPendingProposalsMock = vi.fn()
const approveProposalMock = vi.fn()
const rejectProposalMock = vi.fn()

vi.mock('@/services/wodService', () => ({
  default: {
    getTodayWod: getTodayWodMock,
    getAllWods: getAllWodsMock,
    createWod: createWodMock,
    updateWod: updateWodMock,
    deleteWod: deleteWodMock,
  },
}))

vi.mock('@/services/resultService', () => ({
  default: {
    createResult: createResultMock,
    updateResult: updateResultMock,
  },
}))

vi.mock('@/services/proposalService', () => ({
  default: {
    createProposal: createProposalMock,
    getPendingProposals: getPendingProposalsMock,
    approveProposal: approveProposalMock,
    rejectProposal: rejectProposalMock,
  },
}))

describe('wodStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads today wod, creates and updates results', async () => {
    const { useWodStore } = await import('@/stores/wodStore')
    const store = useWodStore()

    getTodayWodMock.mockResolvedValue({ id: 1 })
    createResultMock.mockResolvedValue({ id: 2 })
    updateResultMock.mockResolvedValue({ id: 3 })

    await expect(store.loadTodayWod()).resolves.toEqual({ id: 1 })
    await expect(store.createResult({})).resolves.toEqual({ id: 2 })
    await expect(store.updateResult(3, {})).resolves.toEqual({ id: 3 })
  })

  it('saves, removes and moderates domain data', async () => {
    const { useWodStore } = await import('@/stores/wodStore')
    const store = useWodStore()

    getAllWodsMock.mockResolvedValue([{ id: 1 }])
    createWodMock.mockResolvedValue({ id: 1 })
    updateWodMock.mockResolvedValue({ id: 2 })
    deleteWodMock.mockResolvedValue({ ok: true })
    createProposalMock.mockResolvedValue({ id: 3 })
    getPendingProposalsMock.mockResolvedValue([{ id: 5 }, { id: 6 }])
    approveProposalMock.mockResolvedValue({ id: 5 })
    rejectProposalMock.mockResolvedValue({ id: 6 })

    await expect(store.loadAllWods()).resolves.toEqual([{ id: 1 }])
    await expect(store.saveWod({ name: 'Fran' })).resolves.toEqual({ id: 1 })
    await expect(store.saveWod({ name: 'Murph' }, 2)).resolves.toEqual({ id: 2 })
    await expect(store.removeWod(2)).resolves.toEqual({ ok: true })
    await expect(store.createProposal({ name: 'Open' })).resolves.toEqual({ id: 3 })
    await expect(store.loadPendingProposals()).resolves.toEqual([{ id: 5 }, { id: 6 }])

    await store.moderateProposal(5, 'approve')
    expect(approveProposalMock).toHaveBeenCalledWith(5)

    store.proposals = [{ id: 6 }, { id: 7 }]
    await store.moderateProposal(6, 'reject')
    expect(rejectProposalMock).toHaveBeenCalledWith(6)
  })
})

const getAllBenchmarksMock = vi.fn()
const getBenchmarkByIdMock = vi.fn()
const createBenchmarkMock = vi.fn()
const updateBenchmarkMock = vi.fn()
const deleteBenchmarkMock = vi.fn()
const createBenchmarkResultMock = vi.fn()
const getMyBenchmarkResultsMock = vi.fn()

vi.mock('@/services/benchmarkService', () => ({
  default: {
    getAllBenchmarks: getAllBenchmarksMock,
    getBenchmarkById: getBenchmarkByIdMock,
    createBenchmark: createBenchmarkMock,
    updateBenchmark: updateBenchmarkMock,
    deleteBenchmark: deleteBenchmarkMock,
    createResult: createBenchmarkResultMock,
    getMyResults: getMyBenchmarkResultsMock,
  },
}))

describe('benchmarkStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads benchmark data and manages results', async () => {
    const { useBenchmarkStore } = await import('@/stores/benchmarkStore')
    const store = useBenchmarkStore()

    getAllBenchmarksMock.mockResolvedValue([{ id: 1 }])
    getBenchmarkByIdMock.mockResolvedValue({ id: 2, name: 'Fran' })
    getMyBenchmarkResultsMock.mockResolvedValue([{ id: 3 }])
    createBenchmarkResultMock.mockResolvedValue({ id: 4 })

    await expect(store.loadBenchmarks()).resolves.toEqual([{ id: 1 }])
    await expect(store.loadBenchmarkById(2)).resolves.toEqual({ id: 2, name: 'Fran' })
    await expect(store.loadMyResults(2)).resolves.toEqual([{ id: 3 }])
    await expect(store.createResult(2, { result: '03:45' })).resolves.toEqual({ id: 4 })
  })

  it('saves and removes benchmarks', async () => {
    const { useBenchmarkStore } = await import('@/stores/benchmarkStore')
    const store = useBenchmarkStore()

    getAllBenchmarksMock.mockResolvedValue([{ id: 1 }])
    createBenchmarkMock.mockResolvedValue({ id: 1, name: 'Fran' })
    updateBenchmarkMock.mockResolvedValue({ id: 2, name: 'Murph' })
    deleteBenchmarkMock.mockResolvedValue({ ok: true })

    await expect(store.saveBenchmark({ name: 'Fran' })).resolves.toEqual({ id: 1, name: 'Fran' })
    await expect(store.saveBenchmark({ name: 'Murph' }, 2)).resolves.toEqual({ id: 2, name: 'Murph' })
    await expect(store.removeBenchmark(2)).resolves.toEqual({ ok: true })
  })
})
