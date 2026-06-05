
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少项目ID' })

  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      manager: { select: { id: true, name: true, email: true, phone: true } },
      contracts: { orderBy: { createdAt: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: '项目不存在' })
  }

  return {
    ...project,
    warrantyStatus: getWarrantyStatus(project.warrantyEndDate),
  }
})
