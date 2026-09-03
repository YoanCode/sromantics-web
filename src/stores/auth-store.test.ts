import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts with an empty access token when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('persists access token so a new store instance reads it back', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setAccessToken('session-token')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe(
      'session-token'
    )
  })

  it('clears persisted access token when resetAccessToken is used', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setAccessToken('to-clear')
    useAuthStore.getState().auth.resetAccessToken()

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })

  it('updates the signed-in user via setUser', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user and access token and drops persistence', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setAccessToken('will-be-cleared')
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull()
    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })

  describe('isAuthenticated', () => {
    it('should return false when user is null', async () => {
      const useAuthStore = await importAuthStore()
      expect(useAuthStore.getState().auth.isAuthenticated()).toBe(false)
    })

    it('should return false when accessToken is empty', async () => {
      const useAuthStore = await importAuthStore()
      useAuthStore.getState().auth.setUser({
        ...sampleUser,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })

      expect(useAuthStore.getState().auth.isAuthenticated()).toBe(false)
    })

    it('should return false when token is expired', async () => {
      const useAuthStore = await importAuthStore()
      useAuthStore.getState().auth.setUser({
        ...sampleUser,
        exp: Date.now() - 1000, // 已過期
      })
      useAuthStore.getState().auth.setAccessToken('mock-token')

      expect(useAuthStore.getState().auth.isAuthenticated()).toBe(false)
    })

    it('should return true when user, token are valid and not expired', async () => {
      const useAuthStore = await importAuthStore()
      useAuthStore.getState().auth.setUser({
        ...sampleUser,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
      useAuthStore.getState().auth.setAccessToken('mock-token')

      expect(useAuthStore.getState().auth.isAuthenticated()).toBe(true)
    })
  })
})
