import { wodApiClient } from './http'

const wodService = {
  async getTodayWod() {
    const { data } = await wodApiClient.get('/wods/today')
    return unwrapEntity(data)
  },

  async getAllWods() {
    const { data } = await wodApiClient.get('/wods')
    return unwrapCollection(data)
  },

  async createWod(payload) {
    const { data } = await wodApiClient.post('/wods', normalizeWodPayload(payload))
    return unwrapEntity(data)
  },

  async updateWod(id, payload) {
    const { data } = await wodApiClient.put(`/wods/${id}`, normalizeWodPayload(payload))
    return unwrapEntity(data)
  },

  async deleteWod(id) {
    const { data } = await wodApiClient.delete(`/wods/${id}`)
    return data
  },
}

export default wodService

function unwrapEntity(payload) {
  return payload?.data || payload?.wod || payload?.item || payload
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.data || payload?.items || payload?.wods || []
}

function normalizeWodPayload(payload) {
  return {
    name: payload?.name || payload?.title || '',
    description: payload?.description || '',
    type: payload?.type || '',
    date: payload?.date || null,
    approved: payload?.approved ?? true,
  }
}
