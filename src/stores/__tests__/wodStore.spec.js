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
