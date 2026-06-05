import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // 登录页不需要检查
  if (to.path === '/login') return

  // 未认证则跳转登录
  if (!auth.value) {
    try {
      const data = await $fetch('/api/auth/me')
      auth.value = data
    } catch {
      return navigateTo('/login')
    }
  }
})
