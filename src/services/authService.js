import { userApiClient } from './http'

const authService = {
  async login(payload) {
    const { data } = await userApiClient.post('/auth/login', payload)
    return data?.data || data
  },

  async register(payload) {
    const { data } = await userApiClient.post('/users', {
      email: payload?.email || '',
      password: payload?.password || '',
      name: payload?.name || '',
    })
    return data?.data || data
  },
}

export default authService
