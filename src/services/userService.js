import { userApiClient } from './http'

const userService = {
  async getAdminUsers() {
    const { data } = await userApiClient.get('/admin/users')
    return data?.data || data?.users || data?.items || data
  },

  async createAdminUser(payload) {
    const { data } = await userApiClient.post('/admin/users', {
      name: payload?.name || '',
      email: payload?.email || '',
      role: payload?.role || 'USER',
    })
    return data?.data || data?.user || data
  },

  async deleteAdminUser(id) {
    const { data } = await userApiClient.delete(`/admin/users/${id}`)
    return data?.data || data
  },

  async getUserById(id) {
    const { data } = await userApiClient.get(`/users/${id}`)
    return data?.data || data?.user || data?.profile || data
  },

  async getProfile() {
    const { data } = await userApiClient.get('/users/me')
    return data?.data || data?.user || data?.profile || data
  },

  async updateProfile(payload) {
    const requestBody = {}

    if (payload?.name !== undefined) {
      requestBody.name = payload.name
    }

    if (payload?.weight !== undefined && payload?.weight !== '') {
      requestBody.weight = Number(payload.weight)
    }

    if (payload?.height !== undefined && payload?.height !== '') {
      requestBody.height = Number(payload.height)
    }

    if (payload?.password) {
      requestBody.password = payload.password
    }

    const { data } = await userApiClient.put('/users/me', requestBody)
    return data?.data || data?.user || data?.profile || data
  },
}

export default userService
