const TOKEN_KEY = 'wodtracker_token'
const USER_KEY = 'wodtracker_user'
const ROLE_KEY = 'wodtracker_role'
export const AUTH_UNAUTHORIZED_EVENT = 'wodtracker:unauthorized'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const role = localStorage.getItem(ROLE_KEY) || ''
  const rawUser = localStorage.getItem(USER_KEY)
  let parsedUser = null

  if (rawUser) {
    try {
      parsedUser = JSON.parse(rawUser)
    } catch {
      localStorage.removeItem(USER_KEY)
    }
  }

  return {
    token,
    role,
    user: parsedUser,
  }
}

export function setAuthData({ token, user, role }) {
  localStorage.setItem(TOKEN_KEY, token || '')
  localStorage.setItem(ROLE_KEY, role || '')

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return
  }

  localStorage.removeItem(USER_KEY)
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
}
