import { wodApiClient } from './http'

const resultService = {
  async createResult(payload) {
    const { data } = await wodApiClient.post('/results', {
      wodId: payload?.wodId,
      result: payload?.result || payload?.score || '',
    })
    return data?.data || data?.result || data
  },

  async updateResult(id, payload) {
    const { data } = await wodApiClient.put(`/results/${id}`, {
      wodId: payload?.wodId,
      result: payload?.result || payload?.score || '',
    })
    return data?.data || data?.result || data
  },

  async getResultsByUser(userId) {
    const { data } = await wodApiClient.get(`/results/user/${userId}`)

    if (Array.isArray(data)) {
      return data
    }

    return data?.data || data?.items || data?.results || []
  },

  async getResultsByWod(wodId) {
    const { data } = await wodApiClient.get(`/results/wod/${wodId}`)

    if (Array.isArray(data)) {
      return data
    }

    return data?.data || data?.items || data?.results || []
  },
}

export default resultService
