import type { SessionData } from '~/types'

export const useAuth = () => useState<SessionData | null>('auth', () => null)

export const useAuthFetch = () => {
  const auth = useAuth()

  const login = async (email: string, password: string) => {
    const data = await $fetch<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    auth.value = data
    return data
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    auth.value = null
    navigateTo('/login')
  }

  const fetchUser = async () => {
    try {
      const data = await $fetch<SessionData>('/api/auth/me')
      auth.value = data
    } catch {
      auth.value = null
    }
  }

  return { login, logout, fetchUser }
}
