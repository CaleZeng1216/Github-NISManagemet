
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少用户ID' })

  const body = await readBody(event)
  const { name, email, phone, role, password } = body

  const data: any = {}
  if (name) data.name = name
  if (email) data.email = email
  if (phone !== undefined) data.phone = phone || null
  if (role) data.role = role
  if (password) data.password = hashPassword(password)

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
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
