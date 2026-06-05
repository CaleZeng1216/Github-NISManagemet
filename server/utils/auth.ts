import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'nm_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7天

interface SessionData {
  userId: number
  email: string
  name: string
  role: string
}

// 简单的session存储（生产环境应使用Redis或数据库）
const sessions = new Map<string, SessionData>()

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function createSession(data: SessionData): string {
  const token = crypto.randomUUID()
  sessions.set(token, data)
  return token
}

export function getLocalSession(token: string): SessionData | null {
  return sessions.get(token) || null
}

export function destroySession(token: string): void {
  sessions.delete(token)
}

export function setSessionCookie(event: any, token: string): void {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })
}

export function clearSessionCookie(event: any): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function getSessionToken(event: any): string | undefined {
  return getCookie(event, SESSION_COOKIE)
}

export async function requireAuth(event: any): Promise<SessionData> {
  const token = getSessionToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  const session = getLocalSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  }
  return session
}

export async function requireAdmin(event: any): Promise<SessionData> {
  const session = await requireAuth(event)
  if (session.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: '需要管理员权限' })
  }
  return session
}
