import { wodApiClient } from './http'

const prService = {
  async getExercises() {
    const { data } = await wodApiClient.get('/prs/exercises')
    return unwrapCollection(data)
  },

  async getCurrentPr(exercise) {
    const { data } = await wodApiClient.get(`/prs/${exercise}/me`)
    return unwrapEntity(data)
  },

  async createPr(exercise, payload) {
    const { data } = await wodApiClient.post(`/prs/${exercise}`, {
      weight: normalizeWeight(payload?.weight),
    })
    return unwrapEntity(data)
  },

  async getHistory(exercise) {
    const { data } = await wodApiClient.get(`/prs/${exercise}/me/history`)
    return unwrapCollection(data)
  },
}

export default prService

function unwrapEntity(payload) {
  return payload?.data || payload?.pr || payload?.item || payload
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.data || payload?.items || payload?.exercises || payload?.records || payload?.history || []
}

function normalizeWeight(value) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    return normalized === '' ? null : Number(normalized)
  }

  return null
}
