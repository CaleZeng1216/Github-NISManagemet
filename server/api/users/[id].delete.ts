
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少用户ID' })

  // 检查该用户是否有负责的项目
  const projectCount = await prisma.project.count({ where: { managerId: Number(id) } })
  if (projectCount > 0) {
    throw createError({ statusCode: 400, statusMessage: `该用户还有 ${projectCount} 个负责项目，无法删除` })
  }

  await prisma.user.delete({ where: { id: Number(id) } })
  return { message: '删除成功' }
})
