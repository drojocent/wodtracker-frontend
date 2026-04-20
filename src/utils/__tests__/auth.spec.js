import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthData,
  getStoredAuth,
  getStoredToken,
  notifyUnauthorized,
  setAuthData,
} from '@/utils/auth'

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and reads auth data from localStorage', () => {
    setAuthData({
      token: 'token-123',
      role: 'ADMIN',
      user: { id: 7, name: 'Dani' },
    })

    expect(getStoredToken()).toBe('token-123')
    expect(getStoredAuth()).toEqual({
      token: 'token-123',
      role: 'ADMIN',
      user: { id: 7, name: 'Dani' },
    })
  })

  it('clears auth data and removes broken user payloads', () => {
    localStorage.setItem('wodtracker_token', 'abc')
    localStorage.setItem('wodtracker_role', 'USER')
    localStorage.setItem('wodtracker_user', '{broken-json')

    expect(getStoredAuth()).toEqual({
      token: 'abc',
      role: 'USER',
      user: null,
    })

    clearAuthData()
    expect(getStoredToken()).toBe('')
  })

  it('dispatches the unauthorized event', () => {
    const listener = vi.fn()
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener)

    notifyUnauthorized()

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener)
  })
})
