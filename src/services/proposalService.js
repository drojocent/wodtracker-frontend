import { wodApiClient } from './http'

const proposalService = {
  async createProposal(payload) {
    const { data } = await wodApiClient.post('/proposals', {
      name: payload?.name || payload?.title || '',
      description: payload?.description || '',
      type: payload?.type || '',
    })
    return unwrapEntity(data)
  },

  async getPendingProposals() {
    const { data } = await wodApiClient.get('/proposals/pending')
    return unwrapCollection(data)
  },

  async approveProposal(id) {
    const { data } = await wodApiClient.patch(`/proposals/${id}/approve`)
    return unwrapEntity(data)
  },

  async rejectProposal(id) {
    const { data } = await wodApiClient.patch(`/proposals/${id}/reject`)
    return unwrapEntity(data)
  },
}

export default proposalService

function unwrapEntity(payload) {
  return payload?.data || payload?.proposal || payload?.item || payload
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.data || payload?.items || payload?.proposals || []
}
