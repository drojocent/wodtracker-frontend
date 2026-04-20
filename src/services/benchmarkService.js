import { wodApiClient } from './http'

const benchmarkService = {
  async getAllBenchmarks() {
    const { data } = await wodApiClient.get('/benchmarks')
    return unwrapCollection(data)
  },

  async getBenchmarkById(id) {
    const { data } = await wodApiClient.get(`/benchmarks/${id}`)
    return unwrapEntity(data)
  },

  async createBenchmark(payload) {
    const { data } = await wodApiClient.post('/benchmarks', normalizeBenchmarkPayload(payload))
    return unwrapEntity(data)
  },

  async updateBenchmark(id, payload) {
    const { data } = await wodApiClient.put(`/benchmarks/${id}`, normalizeBenchmarkPayload(payload))
    return unwrapEntity(data)
  },

  async deleteBenchmark(id) {
    const { data } = await wodApiClient.delete(`/benchmarks/${id}`)
    return data
  },

  async createResult(benchmarkId, payload) {
    const { data } = await wodApiClient.post(`/benchmarks/${benchmarkId}/results`, {
      result: payload?.result || payload?.score || '',
    })
    return unwrapEntity(data)
  },

  async getMyResults(benchmarkId) {
    const { data } = await wodApiClient.get(`/benchmarks/${benchmarkId}/results/me`)
    return unwrapCollection(data)
  },
}

export default benchmarkService

function unwrapEntity(payload) {
  return payload?.data || payload?.benchmark || payload?.result || payload?.item || payload
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.data || payload?.items || payload?.benchmarks || payload?.results || []
}

function normalizeBenchmarkPayload(payload) {
  return {
    name: payload?.name || payload?.title || '',
    description: payload?.description || '',
    type: payload?.type || '',
  }
}
