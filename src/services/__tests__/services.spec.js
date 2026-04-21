import { describe, expect, it, vi } from 'vitest'

const userApiClient = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}

const wodApiClient = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}

vi.mock('@/services/http', () => ({
  userApiClient,
  wodApiClient,
}))

describe('service wrappers', () => {
  it('maps auth requests and responses', async () => {
    const authService = (await import('@/services/authService')).default
    userApiClient.post.mockResolvedValueOnce({ data: { accessToken: 'jwt' } })
    userApiClient.post.mockResolvedValueOnce({ data: { ok: true } })

    await expect(authService.login({ email: 'a', password: 'b' })).resolves.toEqual({ accessToken: 'jwt' })
    await expect(authService.register({ email: 'a', password: 'b', name: 'Dani' })).resolves.toEqual({ ok: true })

    expect(userApiClient.post).toHaveBeenNthCalledWith(1, '/auth/login', { email: 'a', password: 'b' })
    expect(userApiClient.post).toHaveBeenNthCalledWith(2, '/users', { email: 'a', password: 'b', name: 'Dani' })
  })

  it('maps user service payloads', async () => {
    const userService = (await import('@/services/userService')).default
    userApiClient.get.mockResolvedValueOnce({ data: { user: { id: 1 } } })
    userApiClient.get.mockResolvedValueOnce({ data: { profile: { id: 2 } } })
    userApiClient.put.mockResolvedValueOnce({ data: { data: { id: 3 } } })

    await expect(userService.getUserById(7)).resolves.toEqual({ id: 1 })
    await expect(userService.getProfile()).resolves.toEqual({ id: 2 })
    await expect(userService.updateProfile({ name: 'Dani', weight: '78.5', height: '180', password: '1234' })).resolves.toEqual({ id: 3 })

    expect(userApiClient.put).toHaveBeenCalledWith('/users/me', {
      name: 'Dani',
      weight: 78.5,
      height: 180,
      password: '1234',
    })
  })

  it('maps result and proposal services', async () => {
    const resultService = (await import('@/services/resultService')).default
    const proposalService = (await import('@/services/proposalService')).default
    wodApiClient.post.mockResolvedValueOnce({ data: { result: { id: 1 } } })
    wodApiClient.put.mockResolvedValueOnce({ data: { result: { id: 2 } } })
    wodApiClient.get.mockResolvedValueOnce({ data: { results: [{ id: 3 }] } })
    wodApiClient.get.mockResolvedValueOnce({ data: [{ id: 4 }] })
    wodApiClient.post.mockResolvedValueOnce({ data: { proposal: { id: 5 } } })
    wodApiClient.get.mockResolvedValueOnce({ data: { proposals: [{ id: 6 }] } })
    wodApiClient.patch.mockResolvedValueOnce({ data: { item: { id: 7 } } })
    wodApiClient.patch.mockResolvedValueOnce({ data: { data: { id: 8 } } })

    await expect(resultService.createResult({ wodId: 9, score: '04:20' })).resolves.toEqual({ id: 1 })
    await expect(resultService.updateResult(2, { wodId: 9, result: '04:00' })).resolves.toEqual({ id: 2 })
    await expect(resultService.getResultsByUser(7)).resolves.toEqual([{ id: 3 }])
    await expect(resultService.getResultsByWod(9)).resolves.toEqual([{ id: 4 }])
    await expect(proposalService.createProposal({ title: 'Open', description: 'Desc', type: 'AMRAP' })).resolves.toEqual({ id: 5 })
    await expect(proposalService.getPendingProposals()).resolves.toEqual([{ id: 6 }])
    await expect(proposalService.approveProposal(7)).resolves.toEqual({ id: 7 })
    await expect(proposalService.rejectProposal(8)).resolves.toEqual({ id: 8 })
  })

  it('maps wod service payloads and unwraps collections', async () => {
    const wodService = (await import('@/services/wodService')).default
    wodApiClient.get.mockResolvedValueOnce({ data: { wod: { id: 1 } } })
    wodApiClient.get.mockResolvedValueOnce({ data: { wods: [{ id: 2 }] } })
    wodApiClient.post.mockResolvedValueOnce({ data: { item: { id: 3 } } })
    wodApiClient.put.mockResolvedValueOnce({ data: { data: { id: 4 } } })
    wodApiClient.delete.mockResolvedValueOnce({ data: { success: true } })

    await expect(wodService.getTodayWod()).resolves.toEqual({ id: 1 })
    await expect(wodService.getAllWods()).resolves.toEqual([{ id: 2 }])
    await expect(wodService.createWod({ title: 'Fran', description: 'Desc', type: 'FOR_TIME', date: '2026-04-20' })).resolves.toEqual({ id: 3 })
    await expect(wodService.updateWod(4, { name: 'Murph', description: 'Desc', type: 'AMRAP', date: null, approved: false })).resolves.toEqual({ id: 4 })
    await expect(wodService.deleteWod(5)).resolves.toEqual({ success: true })

    expect(wodApiClient.post).toHaveBeenCalledWith('/wods', {
      name: 'Fran',
      description: 'Desc',
      type: 'FOR_TIME',
      date: '2026-04-20',
      approved: true,
    })
  })

  it('maps benchmark service payloads and unwraps collections', async () => {
    const benchmarkService = (await import('@/services/benchmarkService')).default
    wodApiClient.get.mockResolvedValueOnce({ data: { benchmarks: [{ id: 1 }] } })
    wodApiClient.get.mockResolvedValueOnce({ data: { benchmark: { id: 2 } } })
    wodApiClient.post.mockResolvedValueOnce({ data: { item: { id: 3 } } })
    wodApiClient.put.mockResolvedValueOnce({ data: { data: { id: 4 } } })
    wodApiClient.delete.mockResolvedValueOnce({ data: { success: true } })
    wodApiClient.post.mockResolvedValueOnce({ data: { result: { id: 5 } } })
    wodApiClient.get.mockResolvedValueOnce({ data: { results: [{ id: 6 }] } })

    await expect(benchmarkService.getAllBenchmarks()).resolves.toEqual([{ id: 1 }])
    await expect(benchmarkService.getBenchmarkById(2)).resolves.toEqual({ id: 2 })
    await expect(
      benchmarkService.createBenchmark({ title: 'Fran', description: 'Desc', type: 'FOR_TIME' }),
    ).resolves.toEqual({ id: 3 })
    await expect(
      benchmarkService.updateBenchmark(4, { name: 'Murph', description: 'Hero', type: 'AMRAP' }),
    ).resolves.toEqual({ id: 4 })
    await expect(benchmarkService.deleteBenchmark(5)).resolves.toEqual({ success: true })
    await expect(benchmarkService.createResult(8, { score: '03:55' })).resolves.toEqual({ id: 5 })
    await expect(benchmarkService.getMyResults(8)).resolves.toEqual([{ id: 6 }])

    expect(wodApiClient.post).toHaveBeenCalledWith('/benchmarks', {
      name: 'Fran',
      description: 'Desc',
      type: 'FOR_TIME',
    })
    expect(wodApiClient.post).toHaveBeenCalledWith('/benchmarks/8/results', {
      result: '03:55',
    })
  })

  it('maps personal record service payloads and unwraps collections', async () => {
    const prService = (await import('@/services/prService')).default
    wodApiClient.get.mockResolvedValueOnce({ data: { exercises: ['BACK_SQUAT', 'SNATCH'] } })
    wodApiClient.get.mockResolvedValueOnce({ data: { item: { id: 2 } } })
    wodApiClient.post.mockResolvedValueOnce({ data: { data: { id: 3 } } })
    wodApiClient.get.mockResolvedValueOnce({ data: { history: [{ id: 4 }] } })

    await expect(prService.getExercises()).resolves.toEqual(['BACK_SQUAT', 'SNATCH'])
    await expect(prService.getCurrentPr('BACK_SQUAT')).resolves.toEqual({ id: 2 })
    await expect(prService.createPr('BACK_SQUAT', { weight: '145,5' })).resolves.toEqual({ id: 3 })
    await expect(prService.getHistory('BACK_SQUAT')).resolves.toEqual([{ id: 4 }])

    expect(wodApiClient.post).toHaveBeenCalledWith('/prs/BACK_SQUAT', {
      weight: 145.5,
    })
  })
})
