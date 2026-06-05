
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入邮箱和密码' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  if (!comparePassword(password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const token = createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  setSessionCookie(event, token)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
})
