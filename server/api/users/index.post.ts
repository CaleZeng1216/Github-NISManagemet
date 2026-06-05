
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { name, email, phone, role, password } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: '姓名、邮箱和密码为必填项' })
  }

  // 检查邮箱是否已存在
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: '该邮箱已被注册' })
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      role: role || 'PM',
      password: hashPassword(password),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  return user
})
