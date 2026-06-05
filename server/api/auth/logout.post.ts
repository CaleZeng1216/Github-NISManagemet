
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const token = getSessionToken(event)
  if (token) {
    destroySession(token)
  }
  clearSessionCookie(event)
  return { message: '已退出登录' }
})
